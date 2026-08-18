package services

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/input"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"golang.org/x/crypto/bcrypt"
)

// Sentinel errors the handler maps to HTTP status codes.
var (
	ErrWeakPassword      = errors.New("password must be at least 8 characters and contain a letter and a digit")
	ErrEmailTaken        = errors.New("email is already in use")
	ErrLastAdmin         = errors.New("cannot delete the last administrator")
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidEmailToken = errors.New("invalid or expired email verification token")
)

const emailVerifyTTL = time.Hour

type userService struct {
	repo      output.UserRepository
	email     output.EmailSender
	tokens    output.SessionStore
	verifyURL string
}

func NewUserService(repo output.UserRepository, email output.EmailSender, tokens output.SessionStore, verifyURL string) input.UserService {
	return &userService{repo: repo, email: email, tokens: tokens, verifyURL: verifyURL}
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
