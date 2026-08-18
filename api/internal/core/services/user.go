package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	pkgimage "apcms/internal/pkg/image"

	"golang.org/x/crypto/bcrypt"
)

// Sentinel errors the handler maps to HTTP status codes.
var (
	ErrWeakPassword      = errors.New("password must be at least 8 characters and contain a letter and a digit")
	ErrEmailTaken        = errors.New("email is already in use")
	ErrLastAdmin         = errors.New("cannot delete the last administrator")
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidEmailToken = errors.New("invalid or expired email verification token")
	ErrEmailNotSent       = errors.New("the invitation email could not be sent")
)

const (
	emailVerifyTTL  = time.Hour
	inviteTokenTTL  = 24 * time.Hour
)

type userService struct {
	repo      output.UserRepository
	email     output.EmailSender
	tokens    output.SessionStore
	audit     output.AuditRepository
	fileStore output.FileStorage
	verifyURL string
	resetURL  string
}

func NewUserService(
	repo output.UserRepository,
	email output.EmailSender,
	tokens output.SessionStore,
	audit output.AuditRepository,
	fileStore output.FileStorage,
	verifyURL string,
	resetURL string,
) input.UserService {
	return &userService{
		repo: repo, email: email, tokens: tokens, audit: audit,
		fileStore: fileStore, verifyURL: verifyURL, resetURL: resetURL,
	}
}

func (s *userService) List(ctx context.Context, opts query.QueryOptions) ([]domain.User, int64, error) {
	return s.repo.FindAll(ctx, opts)
}

func (s *userService) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *userService) Create(ctx context.Context, in *domain.UserCreate) (*domain.User, error) {

	if !validPassword(in.Password) {
		return nil, ErrWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	in.Password = string(hash)

	user, err := s.repo.Save(ctx, in)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrEmailTaken
		}
		return nil, err
	}

	return user, nil
}

func (s *userService) Update(ctx context.Context, id int64, in *domain.UserUpdate) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	// Deactivating or demoting the only administrator would lock everyone out
	// of user management, so both paths run through the same guard as Delete.
	losesAdmin := (in.IsActive != nil && !*in.IsActive) ||
		(in.RoleID != nil && *in.RoleID != user.RoleID)
	if losesAdmin {
		if err := s.assertNotLastAdmin(ctx, user); err != nil {
			return err
		}
	}

	if err := s.repo.Update(ctx, id, in); err != nil {
		if isUniqueViolation(err) {
			return ErrEmailTaken
		}
		return err
	}

	return nil
}

func (s *userService) Delete(ctx context.Context, id int64) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}
	if err := s.assertNotLastAdmin(ctx, user); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

// SetPassword lets an administrator replace another account's password
// without going through the e-mail reset flow.
func (s *userService) SetPassword(ctx context.Context, id int64, password string) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}
	if !validPassword(password) {
		return ErrWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.repo.UpdatePassword(ctx, strconv.FormatInt(id, 10), string(hash))
}

// assertNotLastAdmin fails when the user is the only active administrator left.
func (s *userService) assertNotLastAdmin(ctx context.Context, user *domain.User) error {
	if user.Role == nil || user.Role.Slug != "admin" || !user.IsActive {
		return nil
	}
	admins, err := s.repo.CountByRoleID(ctx, user.RoleID)
	if err != nil {
		return err
	}
	if admins <= 1 {
		return ErrLastAdmin
	}
	return nil
}

// EmailAvailable powers the inline check on the create form.
func (s *userService) EmailAvailable(ctx context.Context, email string) (bool, error) {
	taken, err := s.repo.ExistsByEmail(ctx, strings.TrimSpace(email))
	if err != nil {
		return false, err
	}
	return !taken, nil
}

func (s *userService) ListSessions(ctx context.Context, id int64) ([]domain.Session, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return s.tokens.ListSessions(ctx, strconv.FormatInt(id, 10))
}

func (s *userService) RevokeSession(ctx context.Context, id int64, sessionID string) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}
	return s.tokens.DeleteSession(ctx, strconv.FormatInt(id, 10), sessionID)
}

func (s *userService) ListActivity(ctx context.Context, id int64, limit int) ([]domain.AuditRecord, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return s.audit.ListByUser(ctx, id, limit)
}

// UploadAvatar stores the image and returns the public URL it was saved at.
func (s *userService) UploadAvatar(ctx context.Context, id int64, file domain.UploadAvatar) (string, error) {
	if s.fileStore == nil {
		return "", ErrStorageUnavailable
	}
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", ErrUserNotFound
	}

	webpBytes, err := pkgimage.ConvertToWebP(file.File, pkgimage.DefaultQuality)
	if err != nil {
		return "", fmt.Errorf("avatar: convert to webp: %w", err)
	}

	path := "avatars/" + strconv.FormatInt(id, 10) + ".webp"
	url, err := s.fileStore.Upload(ctx, path, bytes.NewReader(webpBytes), int64(len(webpBytes)), "image/webp")
	if err != nil {
		return "", err
	}

	if err := s.repo.UpdateAvatar(ctx, id, url); err != nil {
		return "", err
	}
	return url, nil
}

// SendInvite mails a one-time link the new user can set their password with.
// Unlike the public forgot-password flow this one reports delivery failures,
// because an admin needs to know the invitation never went out.
func (s *userService) SendInvite(ctx context.Context, id int64) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	token, err := randomToken()
	if err != nil {
		return err
	}
	if err := s.tokens.SaveResetToken(ctx, token, strconv.FormatInt(id, 10), inviteTokenTTL); err != nil {
		return err
	}

	link := s.resetURL + "?token=" + token
	body := "<p>Hi " + user.DisplayName + ",</p>" +
		"<p>An account has been created for you on the CMS.</p>" +
		"<p>Sign in with <b>" + user.Email + "</b> after choosing a password: " +
		"<a href=\"" + link + "\">set your password</a>.</p>" +
		"<p>The link expires in 24 hours.</p>"

	if err := s.email.Send(ctx, []string{user.Email}, "Your CMS account", body); err != nil {
		return fmt.Errorf("%w: %v", ErrEmailNotSent, err)
	}
	return nil
}

// validPassword enforces: >= 8 chars, at least one letter and one digit.
func validPassword(pw string) bool {
	if len(pw) < 8 {
		return false
	}
	var hasLetter, hasDigit bool
	for _, c := range pw {
		switch {
		case (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'):
			hasLetter = true
		case c >= '0' && c <= '9':
			hasDigit = true
		}
	}
	return hasLetter && hasDigit
}

func isUniqueViolation(err error) bool {
	return err != nil && strings.Contains(err.Error(), "23505")
}
