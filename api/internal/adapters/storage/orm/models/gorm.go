package models

type TableNamer interface {
	TableName() string
}

type ModelList []TableNamer

func All() ModelList {
	// Ordered so every FK target is migrated before the tables that reference it.
	return ModelList{
		// reference / lookup data (no outgoing FKs)
		&RoleModel{},
		&PermissionModel{},
		&TagModel{},
		&PostStatusModel{},
		&PostTypeModel{},
		&ContentFormatModel{},
		&CommentStatusModel{},
		&SettingTypeModel{},
		&AuditActionModel{},
		// core entities
		&RolePermissionModel{}, // → roles, permissions
		&UserModel{},           // → roles
		&CategoriesModel{},       // → categories (self)
		&MediaModel{},          // → users
		&PostModel{},           // → users, lookups
		&PostTagModel{},        // → posts, tags
		&PostCategoriesModel{},   // → posts, categories
		&PostMetaModel{},       // → posts
		&PostRevisionModel{},   // → posts, users, content_formats
		&CommentModel{},        // → posts, users, comments (self), comment_statuses
		&SettingModel{},        // → setting_types
		&AuditLogModel{},       // → users, audit_actions
	}
}
