package services

import (
	"context"
	"errors"
	//"strconv"
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

func (s *userService) Create(ctx context.Context, in *domain.UserCreate) error {

	if !validPassword(in.Password) {
		return ErrWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	in.Password = string(hash)

	if err := s.repo.Save(ctx, in); err != nil {
		if isUniqueViolation(err) {
			return ErrEmailTaken
		}
		return err
	}

	return nil
}

func (s *userService) Update(ctx context.Context, id int64, in *domain.UserUpdate) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	if err := s.repo.Update(ctx, id, in); err != nil {
		if isUniqueViolation(err) {
			return ErrEmailTaken
		}
		return err
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
