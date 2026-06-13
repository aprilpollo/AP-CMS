package views

// vwTag pairs each tag with the number of posts referencing it, replacing the
// post_tags LEFT JOIN + aggregate done at query time.
const vwTag = `CREATE VIEW vw_tag AS
SELECT
    t.id,
    t.name,
    t.slug,
    count(pt.post_id) AS post_count
FROM tags t
LEFT JOIN post_tags pt ON pt.tag_id = t.id
GROUP BY t.id`

// VWTag is the read model backed by the vw_tag SQL view.
type VWTag struct {
	ID        int64  `gorm:"column:id"`
	Name      string `gorm:"column:name"`
	Slug      string `gorm:"column:slug"`
	PostCount int64  `gorm:"column:post_count"`
}

func (VWTag) TableName() string { return "vw_tag" }
