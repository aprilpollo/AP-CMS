package views

import (
	"encoding/json"
	"time"
    "apcms/internal/core/domain"
)

const vwPost = `CREATE VIEW vw_post AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.content,
    p.excerpt,
    p.featured_image_url,
    p.reading_time_min,
    p.published_at,
    p.created_at,
    p.updated_at,
    p.status_id,
    ps.code  AS status_code,
    ps.label AS status_label,
    p.post_type_id,
    pt.code  AS type_code,
    pt.label AS type_label,
    p.content_format_id,
    cf.code  AS content_format_code,
    p.author_id,
    au.email         AS author_email,
    au.display_name  AS author_display_name,
    au.avatar_url    AS author_avatar_url,
    au.role_id       AS author_role_id,
    au.is_active     AS author_is_active,
    au.last_login_at AS author_last_login_at,
    au.created_at    AS author_created_at,
    au.updated_at    AS author_updated_at,
    COALESCE(
        (
            SELECT jsonb_agg(
                       jsonb_build_object(
                           'id', c.id, 'parent_id', c.parent_id, 'name', c.name,
                           'slug', c.slug, 'description', c.description, 'sort_order', c.sort_order
                       )
                       ORDER BY c.sort_order, c.name
                   )
            FROM post_categories pc
            JOIN categories c ON c.id = pc.category_id
            WHERE pc.post_id = p.id
        ),
        '[]'::jsonb
    ) AS categories,
    COALESCE(
        (
            SELECT jsonb_agg(
                       jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
                       ORDER BY t.name
                   )
            FROM post_tags ptg
            JOIN tags t ON t.id = ptg.tag_id
            WHERE ptg.post_id = p.id
        ),
        '[]'::jsonb
    ) AS tags
FROM posts p
JOIN post_statuses   ps ON ps.id = p.status_id
JOIN post_types      pt ON pt.id = p.post_type_id
JOIN content_formats cf ON cf.id = p.content_format_id
LEFT JOIN users      au ON au.id = p.author_id`

const vwPostTitle = `CREATE VIEW vw_post_title AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.status_id,
    ps.code AS "status_code",
    p.published_at,
    CASE
        WHEN u.id IS NULL THEN NULL
        ELSE jsonb_build_object(
            'id', u.id,
            'display_name', u.display_name,
            'first_name', u.first_name,
            'last_name', u.last_name,
			'email', u.email,
            'avatar_url', u.avatar_url
        )
    END AS "author",

    COALESCE(
        (
            SELECT jsonb_agg(
                       jsonb_build_object(
                           'id', c.id, 'parent_id', c.parent_id, 'name', c.name,
                           'slug', c.slug, 'description', c.description, 'sort_order', c.sort_order
                       )
                       ORDER BY c.sort_order, c.name
                   )
            FROM post_categories pc
            JOIN categories c ON c.id = pc.category_id
            WHERE pc.post_id = p.id
        ),
        '[]'::jsonb
    ) AS categories,
    COALESCE(
        (
            SELECT jsonb_agg(
                       jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
                       ORDER BY t.name
                   )
            FROM post_tags ptg
            JOIN tags t ON t.id = ptg.tag_id
            WHERE ptg.post_id = p.id
        ),
        '[]'::jsonb
    ) AS tags
FROM posts p
LEFT JOIN users u ON u.id = p.author_id AND u.deleted_at IS NULL AND u.is_active = true
LEFT JOIN post_statuses ps ON ps.id = p.status_id
WHERE p.deleted_at IS NULL 
`

type VWPost struct {
	ID               int64      `gorm:"column:id"`
	Title            string     `gorm:"column:title"`
	Slug             string     `gorm:"column:slug"`
	Content          *string    `gorm:"column:content"`
	Excerpt          *string    `gorm:"column:excerpt"`
	FeaturedImageURL *string    `gorm:"column:featured_image_url"`
	ReadingTimeMin   *int       `gorm:"column:reading_time_min"`
	PublishedAt      *time.Time `gorm:"column:published_at"`
	CreatedAt        time.Time  `gorm:"column:created_at"`
	UpdatedAt        time.Time  `gorm:"column:updated_at"`

	StatusID        int64  `gorm:"column:status_id"`
	StatusCode      string `gorm:"column:status_code"`
	StatusLabel     string `gorm:"column:status_label"`
	PostTypeID      int64  `gorm:"column:post_type_id"`
	TypeCode        string `gorm:"column:type_code"`
	TypeLabel       string `gorm:"column:type_label"`
	ContentFormatID int64  `gorm:"column:content_format_id"`
	ContentFormat   string `gorm:"column:content_format_code"`

	AuthorID          *int64     `gorm:"column:author_id"`
	AuthorEmail       *string    `gorm:"column:author_email"`
	AuthorDisplayName *string    `gorm:"column:author_display_name"`
	AuthorAvatarURL   *string    `gorm:"column:author_avatar_url"`
	AuthorRoleID      *int64     `gorm:"column:author_role_id"`
	AuthorIsActive    *bool      `gorm:"column:author_is_active"`
	AuthorLastLoginAt *time.Time `gorm:"column:author_last_login_at"`
	AuthorCreatedAt   *time.Time `gorm:"column:author_created_at"`
	AuthorUpdatedAt   *time.Time `gorm:"column:author_updated_at"`

	// Categories is a JSON array of category objects aggregated in the view.
	Categories json.RawMessage `gorm:"column:categories;type:jsonb"`
	// Tags is a JSON array of {id, name, slug} aggregated in the view.
	Tags json.RawMessage `gorm:"column:tags;type:jsonb"`
}

type VWPostTitle struct {
	ID               int64           `gorm:"column:id"`
	Title            string          `gorm:"column:title"`
	Slug             string          `gorm:"column:slug"`
	Excerpt          *string         `gorm:"column:excerpt"`
	FeaturedImageURL *string         `gorm:"column:featured_image_url"`
	StatusCode       string          `gorm:"column:status_code"`
	PublishedAt      *time.Time      `gorm:"column:published_at"`
	Author           json.RawMessage `gorm:"column:author;type:jsonb"`
	Categories       json.RawMessage `gorm:"column:categories;type:jsonb"`
	Tags             json.RawMessage `gorm:"column:tags;type:jsonb"`
}

func (VWPost) TableName() string { return "vw_post" }

func (VWPostTitle) TableName() string { return "vw_post_title" }

func (v *VWPost) ToDomain() *domain.Post {
	post := &domain.Post{
		ID:               v.ID,
		Title:            v.Title,
		Slug:             v.Slug,
		Content:          v.Content,
		Excerpt:          v.Excerpt,
		FeaturedImageURL: v.FeaturedImageURL,
		ReadingTimeMin:   v.ReadingTimeMin,
		PublishedAt:      v.PublishedAt,
		CreatedAt:        v.CreatedAt,
		UpdatedAt:        v.UpdatedAt,

		Status:        v.StatusCode,
		Type:          v.TypeCode,
		ContentFormat: v.ContentFormat,
	}

	if v.AuthorID != nil {
		post.AuthorID = v.AuthorID
		post.Author = &domain.User{
			ID:          *v.AuthorID,
			Email:       *v.AuthorEmail,
			DisplayName: *v.AuthorDisplayName,
			AvatarURL:   v.AuthorAvatarURL,
			RoleID:      *v.AuthorRoleID,
			IsActive:    *v.AuthorIsActive,
			LastLoginAt: v.AuthorLastLoginAt,
			CreatedAt:   *v.AuthorCreatedAt,
			UpdatedAt:   *v.AuthorUpdatedAt,
		}
	}

	if err := json.Unmarshal(v.Categories, &post.Categories); err != nil {
		return nil
	}
	if err := json.Unmarshal(v.Tags, &post.Tags); err != nil {
		return nil
	}

	return post
}

func (v *VWPostTitle) ToDomain() *domain.PostTitle {
	postTitle := &domain.PostTitle{
		ID:               v.ID,
		Title:            v.Title,
		Slug:             v.Slug,
		Excerpt:          v.Excerpt,
		FeaturedImageURL: v.FeaturedImageURL,
		Status:           v.StatusCode,
		PublishedAt:      v.PublishedAt,
	}

	if len(v.Author) > 0 {
		if err := json.Unmarshal(v.Author, &postTitle.Author); err != nil {
			return nil
		}
	}
	if err := json.Unmarshal(v.Categories, &postTitle.Categories); err != nil {
		return nil
	}
	if err := json.Unmarshal(v.Tags, &postTitle.Tags); err != nil {
		return nil
	}

	return postTitle
}