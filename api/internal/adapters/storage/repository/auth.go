package repository

import (
	"context"
	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/adapters/storage/orm/views"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"

	"gorm.io/gorm"
)

type authzRepository struct {
	db *gorm.DB
}

// NewAuthzRepository returns an output.AuthzRepository backed by GORM.
func NewAuthzRepository(db *gorm.DB) output.AuthzRepository {
	return &authzRepository{db: db}
}

func (r *authzRepository) PermissionsByUserID(ctx context.Context, userID int64) ([]string, error) {
	var slugs []string
	err := r.db.WithContext(ctx).
		Model(&views.VWUserPermission{}).
		Where("user_id = ?", userID).
		Pluck("slug", &slugs).Error
	return slugs, err
}

type auditRepository struct {
	db *gorm.DB
}

// NewAuditRepository returns an output.AuditRepository backed by GORM.
func NewAuditRepository(db *gorm.DB) output.AuditRepository {
	return &auditRepository{db: db}
}

func (r *auditRepository) Log(ctx context.Context, entry domain.AuditEntry) error {
	var actionID int64
	if err := r.db.WithContext(ctx).
		Model(&models.AuditActionModel{}).
		Where("code = ?", entry.ActionCode).
		Pluck("id", &actionID).Error; err != nil {
		return err
	}
	if actionID == 0 {
		// unknown action code — skip rather than insert a dangling FK
		return nil
	}

	var ip *string
	if entry.IP != "" {
		ip = &entry.IP
	}

	row := models.AuditLogModel{
		UserID:     entry.UserID,
		ActionID:   actionID,
		EntityType: entry.EntityType,
		EntityID:   entry.EntityID,
		IPAddress:  ip,
	}
	return r.db.WithContext(ctx).Create(&row).Error
}
