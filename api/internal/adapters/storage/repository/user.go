package repository

import (
	"context"
	"errors"
	"time"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"apcms/internal/utils"
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

// ExistsByEmail is case-insensitive: addresses differing only by case are the
// same account to a user, and Postgres would otherwise allow both.
func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var total int64
	err := r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("lower(email) = lower(?)", email).
		Count(&total).Error
	return total > 0, err
}

func (r *userRepository) Save(ctx context.Context, user *domain.UserCreate) (*domain.User, error) {

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
		return nil, err
	}

	// Re-read so the caller gets server defaults (is_active, timestamps) and
	// the role relation instead of a half-filled struct.
	return r.FindByID(ctx, row.ID)
}

func (r *userRepository) Update(ctx context.Context, id int64, user *domain.UserUpdate) error {
	return r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("id = ?", id).
		Updates(utils.StructToMap(user)).Error
}

func (r *userRepository) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	return r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("id = ?", id).
		Updates(map[string]any{"password_hash": passwordHash}).Error
}

// Delete soft-deletes the row (UserModel carries gorm.DeletedAt), so audit
// logs and authored posts keep pointing at a resolvable user.
func (r *userRepository) Delete(ctx context.Context, id int64) error {
	res := r.db.WithContext(ctx).Delete(&models.UserModel{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *userRepository) CountByRoleID(ctx context.Context, roleID int64) (int64, error) {
	var total int64
	err := r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("role_id = ? AND is_active = true", roleID).
		Count(&total).Error
	return total, err
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, id int64, at time.Time) error {
	return r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("id = ?", id).
		// UpdateColumns: a successful sign-in is not an edit of the profile,
		// so it must not bump updated_at.
		UpdateColumns(map[string]any{"last_login_at": at}).Error
}

func (r *userRepository) UpdateAvatar(ctx context.Context, id int64, avatarURL string) error {
	return r.db.WithContext(ctx).
		Model(&models.UserModel{}).
		Where("id = ?", id).
		Updates(map[string]any{"avatar_url": avatarURL}).Error
}
