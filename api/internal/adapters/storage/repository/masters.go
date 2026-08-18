package repository

import (
	"context"

	"apcms/internal/adapters/storage/orm/models"
	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"
	"apcms/internal/pkg/query"
	"gorm.io/gorm"
)

type masterRepository struct {
	db *gorm.DB
}

func NewMasterRepository(db *gorm.DB) output.MasterRepository {
	return &masterRepository{db: db}
}

func (r *masterRepository) FindAllRoles(ctx context.Context, opts query.QueryOptions) ([]domain.MasterRole, int64, error) {
	var rows []models.RoleModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.RoleModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.RoleModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	roles := make([]domain.MasterRole, len(rows))
	for i, row := range rows {
		roles[i] = *row.ToDomain()
	}

	return roles, total, nil
}

func (r *masterRepository) FindAllPostStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostStatus, int64, error) {
	var rows []models.PostStatusModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PostStatusModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PostStatusModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	statuses := make([]domain.MasterPostStatus, len(rows))
	for i, row := range rows {
		statuses[i] = *row.ToDomain()
	}

	return statuses, total, nil
}

func (r *masterRepository) FindAllPostTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterPostType, int64, error) {
	var rows []models.PostTypeModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PostTypeModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.PostTypeModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	types := make([]domain.MasterPostType, len(rows))
	for i, row := range rows {
		types[i] = *row.ToDomain()
	}

	return types, total, nil
}

func (r *masterRepository) FindAllContentFormats(ctx context.Context, opts query.QueryOptions) ([]domain.MasterContentFormat, int64, error) {
	var rows []models.ContentFormatModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.ContentFormatModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.ContentFormatModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	formats := make([]domain.MasterContentFormat, len(rows))
	for i, row := range rows {
		formats[i] = *row.ToDomain()
	}

	return formats, total, nil
}

func (r *masterRepository) FindAllCommentStatuses(ctx context.Context, opts query.QueryOptions) ([]domain.MasterCommentStatus, int64, error) {
	var rows []models.CommentStatusModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.CommentStatusModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.CommentStatusModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	statuses := make([]domain.MasterCommentStatus, len(rows))
	for i, row := range rows {
		statuses[i] = *row.ToDomain()
	}

	return statuses, total, nil
}

func (r *masterRepository) FindAllSettingTypes(ctx context.Context, opts query.QueryOptions) ([]domain.MasterSettingType, int64, error) {
	var rows []models.SettingTypeModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.SettingTypeModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.SettingTypeModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	types := make([]domain.MasterSettingType, len(rows))
	for i, row := range rows {
		types[i] = *row.ToDomain()
	}

	return types, total, nil
}

func (r *masterRepository) FindAllAuditActions(ctx context.Context, opts query.QueryOptions) ([]domain.MasterAuditAction, int64, error) {
	var rows []models.AuditActionModel
	var total int64

	countScope := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.AuditActionModel{}), query.QueryOptions{Filters: opts.Filters})
	if err := countScope.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.ApplyToGorm(r.db.WithContext(ctx).Model(&models.AuditActionModel{}), opts).Find(&rows).Error; err != nil {
		return nil, 0, err
	}

	actions := make([]domain.MasterAuditAction, len(rows))
	for i, row := range rows {
		actions[i] = *row.ToDomain()
	}

	return actions, total, nil
}