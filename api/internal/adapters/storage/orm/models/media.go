package models

import "time"

type MediaModel struct {
	ID              int64  `gorm:"primaryKey;autoIncrement"`
	UploaderID      *int64 `gorm:"index"`
	Filename        string `gorm:"not null"`
	OriginalName    string `gorm:"not null"`
	MimeType        string `gorm:"not null;index"`
	URL             string `gorm:"not null"`
	StorageProvider string `gorm:"not null;default:'s3'"`
	SizeBytes       int    `gorm:"not null;default:0"`
	Width           *int
	Height          *int
	AltText         *string
	CreatedAt       time.Time `gorm:"not null;default:now()"`

	Uploader *UserModel `gorm:"foreignKey:UploaderID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (MediaModel) TableName() string { return "media" }
