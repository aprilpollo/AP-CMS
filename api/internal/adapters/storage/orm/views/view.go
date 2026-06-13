package views

// Views maps a view name to its CREATE statement. The migration step drops and
// recreates each entry, so editing the SQL here takes effect on the next
// migrate run. Views must reference only tables that AutoMigrate has created.
var Views = map[string]string{
	"vw_post":            vwPost,
	"vw_post_revision":   vwPostRevision,
	"vw_tag":             vwTag,
	"vw_role_permission": vwRolePermission,
	"vw_user_permission": vwUserPermission,
}
