package models

import "apcms/internal/core/domain"

func (r *RoleModel) ToDomain() *domain.MasterRole {
	return &domain.MasterRole{
		ID:        r.ID,
		Name:      r.Name,
		Slug:      r.Slug,
		Color:     r.Color,
		CreatedAt: r.CreatedAt,
	}
}

func (p *PostStatusModel) ToDomain() *domain.MasterPostStatus {
	return &domain.MasterPostStatus{
		ID:    p.ID,
		Code:  p.Code,
		Label: p.Label,
	}
}

func (p *PostTypeModel) ToDomain() *domain.MasterPostType {
	return &domain.MasterPostType{
		ID:    p.ID,
		Code:  p.Code,
		Label: p.Label,
	}
}

func (c *ContentFormatModel) ToDomain() *domain.MasterContentFormat {
	return &domain.MasterContentFormat{
		ID:    c.ID,
		Code:  c.Code,
		Label: c.Label,
	}
}

func (c *CommentStatusModel) ToDomain() *domain.MasterCommentStatus {
	return &domain.MasterCommentStatus{
		ID:    c.ID,
		Code:  c.Code,
		Label: c.Label,
	}
}

func (s *SettingTypeModel) ToDomain() *domain.MasterSettingType {
	return &domain.MasterSettingType{
		ID:    s.ID,
		Code:  s.Code,
		Label: s.Label,
	}
}

func (a *AuditActionModel) ToDomain() *domain.MasterAuditAction {
	return &domain.MasterAuditAction{
		ID:    a.ID,
		Code:  a.Code,
		Label: a.Label,
	}
}

func (m *CategoriesModel) ToDomain() *domain.Category {
	return &domain.Category{
		ID:          m.ID,
		ParentID:    m.ParentID,
		Name:        m.Name,
		Slug:        m.Slug,
		Description: m.Description,
		SortOrder:   m.SortOrder,
	}
}

func (m *MediaModel) ToDomain() *domain.Media {
	return &domain.Media{
		ID:              m.ID,
		UploaderID:      m.UploaderID,
		Filename:        m.Filename,
		OriginalName:    m.OriginalName,
		MimeType:        m.MimeType,
		URL:             m.URL,
		StorageProvider: m.StorageProvider,
		SizeBytes:       m.SizeBytes,
		Width:           m.Width,
		Height:          m.Height,
		AltText:         m.AltText,
		CreatedAt:       m.CreatedAt,
	}
}

func (m *TagModel) ToDomain() *domain.Tag {
	return &domain.Tag{
		ID:   m.ID,
		Name: m.Name,
		Slug: m.Slug,
	}
}
