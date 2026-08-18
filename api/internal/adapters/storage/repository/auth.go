package repository

import (
	"context"
	"time"
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

// ListByUser returns the most recent audit entries for one user, newest first.
func (r *auditRepository) ListByUser(ctx context.Context, userID int64, limit int) ([]domain.AuditRecord, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	var rows []struct {
		ID         int64
		Code       string
		Label      string
		EntityType string
		EntityID   *int64
		IPAddress  *string
		CreatedAt  time.Time
	}

	err := r.db.WithContext(ctx).
		Model(&models.AuditLogModel{}).
		Select("audit_logs.id, audit_actions.code, audit_actions.label, audit_logs.entity_type, audit_logs.entity_id, audit_logs.ip_address::text, audit_logs.created_at").
		Joins("JOIN audit_actions ON audit_actions.id = audit_logs.action_id").
		Where("audit_logs.user_id = ?", userID).
		Order("audit_logs.created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	records := make([]domain.AuditRecord, len(rows))
	for i, row := range rows {
		records[i] = domain.AuditRecord{
			ID:         row.ID,
			ActionCode: row.Code,
			ActionName: row.Label,
			EntityType: row.EntityType,
			EntityID:   row.EntityID,
			IP:         row.IPAddress,
			CreatedAt:  row.CreatedAt,
		}
	}
	return records, nil
}
