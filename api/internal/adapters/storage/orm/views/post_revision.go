package views

import "time"

// vwPostRevision exposes each revision's content format as its string code,
// folding the content_formats join out of the revision listing.
const vwPostRevision = `CREATE VIEW vw_post_revision AS
SELECT
    pr.id,
    pr.post_id,
    pr.editor_id,
    pr.content,
    cf.code AS content_format_code,
    pr.revision_note,
    pr.created_at
FROM post_revisions pr
JOIN content_formats cf ON cf.id = pr.content_format_id`

// VWPostRevision is the read model backed by the vw_post_revision SQL view.
type VWPostRevision struct {
	ID            int64     `gorm:"column:id"`
	PostID        int64     `gorm:"column:post_id"`
	EditorID      *int64    `gorm:"column:editor_id"`
	Content       *string   `gorm:"column:content"`
	ContentFormat string    `gorm:"column:content_format_code"`
	RevisionNote  *string   `gorm:"column:revision_note"`
	CreatedAt     time.Time `gorm:"column:created_at"`
}

func (VWPostRevision) TableName() string { return "vw_post_revision" }
