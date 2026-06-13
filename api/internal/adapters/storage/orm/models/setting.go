package models

import "time"

// SettingModel holds site-wide key/value configuration.
type SettingModel struct {
	Key   string `gorm:"primaryKey"`
	Value *string

	ValueTypeID int64             `gorm:"not null;index"`
	ValueType   *SettingTypeModel `gorm:"foreignKey:ValueTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Group     string    `gorm:"column:group;not null;default:'general';index"`
	UpdatedAt time.Time `gorm:"not null;default:now()"`
}

func (SettingModel) TableName() string { return "settings" }
