package repository

import (
	"context"
	"errors"
	"time"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) output.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll(ctx context.Context, opts query.QueryOptions) ([]domain.User, int64, error) {
	var rows []models.UserModel
	var total int64

	// total reflects the filters (excluding pagination); only the rows query adds
	// limit/offset.
	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.UserModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.UserModel{}).Preload("Role"), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	users := make([]domain.User, len(rows))
	for i, row := range rows {
		users[i] = *row.ToDomain()
	}

	return users, total, nil
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*domain.User, error) {
	var row models.UserModel
	if err := r.db.WithContext(ctx).Preload("Role").Where("id = ?", id).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return row.ToDomain(), nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var row models.UserModel
	if err := r.db.WithContext(ctx).Preload("Role").Where("email = ?", email).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return row.ToDomain(), nil
}

func (r *userRepository) Save(ctx context.Context, user *domain.UserCreate) error {

	row := &models.UserModel{
		Email:        user.Email,
		PasswordHash: user.Password,
		DisplayName:  user.DisplayName,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		Bio:          user.Bio,
		RoleID:       user.RoleID,
	}

	if err := r.db.WithContext(ctx).Create(row).Error; err != nil {
		return err
	}
	return nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	return r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("id = ?", id).
		Updates(map[string]any{"password_hash": passwordHash, "updated_at": time.Now()}).Error
}
