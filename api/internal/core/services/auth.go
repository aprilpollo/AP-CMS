package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	jwtpkg "apcms/internal/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
)

// Sentinel errors the handler maps to HTTP status codes.
var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrTooManyAttempts    = errors.New("too many failed login attempts, try again later")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

const (
	maxLoginFails = 5
	loginLockTTL  = 15 * time.Minute
	resetTokenTTL = time.Hour
)

type authService struct {
	users      output.UserRepository
	session    output.SessionStore
	audit      output.AuditRepository
	authz      output.AuthzRepository
	email      output.EmailSender
	jwt        *jwtpkg.Manager
	refreshTTL time.Duration
	resetURL   string
}

// NewAuthService returns an input.AuthService.
func NewAuthService(
	users output.UserRepository,
	session output.SessionStore,
	audit output.AuditRepository,
	authz output.AuthzRepository,
	email output.EmailSender,
	jwt *jwtpkg.Manager,
	refreshTTL time.Duration,
	resetURL string,
) input.AuthService {
	return &authService{
		users: users, session: session, audit: audit, authz: authz,
		email: email, jwt: jwt, refreshTTL: refreshTTL, resetURL: resetURL,
	}
}

func (s *authService) Login(ctx context.Context, email, password, ip string) (*domain.TokenPair, error) {
	if count, _ := s.session.LoginFailCount(ctx, ip); count >= maxLoginFails {
		return nil, ErrTooManyAttempts
	}

	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil || !user.IsActive ||
		bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		_, _ = s.session.IncrLoginFail(ctx, ip, loginLockTTL)
		return nil, ErrInvalidCredentials
	}

	_ = s.session.ResetLoginFail(ctx, ip)

	userIDStr := strconv.FormatUint(uint64(user.ID), 10)
	pair, err := s.issue(ctx, userIDStr)
	if err != nil {
		return nil, err
	}

	_ = s.audit.Log(ctx, domain.AuditEntry{
		UserID: &user.ID, ActionCode: "login", EntityType: "user", EntityID: &user.ID, IP: ip,
	})
	return pair, nil
}

func (s *authService) Refresh(ctx context.Context, refreshToken string) (*domain.TokenPair, error) {
	userID, err := s.session.GetRefreshUserID(ctx, refreshToken)
	if err != nil {
		return nil, err
	}
	if userID == "" {
		return nil, ErrInvalidToken
	}

	access, expiresIn, err := s.jwt.Generate(userID)
	if err != nil {
		return nil, err
	}
	return &domain.TokenPair{AccessToken: access, TokenType: "Bearer", ExpiresIn: expiresIn}, nil
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	userID, _ := s.session.GetRefreshUserID(ctx, refreshToken)
	if err := s.session.DeleteRefresh(ctx, refreshToken); err != nil {
		return err
	}
	if uid, err := strconv.ParseUint(userID, 10, 64); err == nil {
		id := int64(uid)
		_ = s.audit.Log(ctx, domain.AuditEntry{
			UserID: &id, ActionCode: "logout", EntityType: "user", EntityID: &id,
		})
	}
	return nil
}

func (s *authService) Me(ctx context.Context, userID int64) (*domain.MeResult, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}

	perms, err := s.authz.PermissionsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if perms == nil {
		perms = []string{}
	}
	return &domain.MeResult{User: user, Permissions: perms}, nil
}

func (s *authService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	// Always succeed silently to avoid leaking which emails exist.
	if user == nil || !user.IsActive {
		return nil
	}

	token, err := randomToken()
	if err != nil {
		return err
	}
	userIDStr := strconv.FormatUint(uint64(user.ID), 10)
	if err := s.session.SaveResetToken(ctx, token, userIDStr, resetTokenTTL); err != nil {
		return err
	}

	link := s.resetURL + "?token=" + token
	body := "<p>We received a request to reset your password.</p>" +
		"<p><a href=\"" + link + "\">Click here to reset it</a>.</p>" +
		"<p>This link expires in 1 hour and can be used once. If you didn't request this, ignore this email.</p>"
	// Best-effort: don't reveal delivery failures to the caller.
	_ = s.email.Send(ctx, []string{user.Email}, "Reset your password", body)
	return nil
}

func (s *authService) ResetPassword(ctx context.Context, token, newPassword, ip string) error {
	userID, err := s.session.GetResetUserID(ctx, token)
	if err != nil {
		return err
	}
	if userID == "" {
		return ErrInvalidToken
	}
	if !validPassword(newPassword) {
		return ErrWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(ctx, userID, string(hash)); err != nil {
		return err
	}

	// One-time use: consume the token.
	_ = s.session.DeleteResetToken(ctx, token)

	if uid, err := strconv.ParseUint(userID, 10, 64); err == nil {
		id := int64(uid)
		_ = s.audit.Log(ctx, domain.AuditEntry{
			UserID: &id, ActionCode: "update", EntityType: "password_reset", EntityID: &id, IP: ip,
		})
	}
	return nil
}

// issue mints a new access token and a fresh opaque refresh token (stored in Redis).
func (s *authService) issue(ctx context.Context, userID string) (*domain.TokenPair, error) {
	access, expiresIn, err := s.jwt.Generate(userID)
	if err != nil {
		return nil, err
	}

	refresh, err := randomToken()
	if err != nil {
		return nil, err
	}
	if err := s.session.SaveRefresh(ctx, refresh, userID, s.refreshTTL); err != nil {
		return nil, err
	}

	return &domain.TokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		TokenType:    "Bearer",
		ExpiresIn:    expiresIn,
	}, nil
}

func randomToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
