package input

import (
	"context"

	"apcms/internal/core/domain"
)


// AuthService is the input port for authentication use cases.
type AuthService interface {
	Login(ctx context.Context, email, password, ip string) (*domain.TokenPair, error)
	Refresh(ctx context.Context, refreshToken string) (*domain.TokenPair, error)
	Logout(ctx context.Context, refreshToken string) error
	Me(ctx context.Context, userID int64) (*domain.MeResult, error)
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token, newPassword, ip string) error
	Update(ctx context.Context, userID int64, in *domain.UserUpdate) error
	UploadAvatar(ctx context.Context, userID int64, file domain.UploadAvatar) error
}
