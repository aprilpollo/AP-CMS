package domain

import (
	"io"
	"time"
)

type Media struct {
	ID              int64     `json:"id"`
	UploaderID      *int64    `json:"uploader_id,omitempty"`
	Filename        string    `json:"filename"`
	OriginalName    string    `json:"original_name"`
	MimeType        string    `json:"mime_type"`
	URL             string    `json:"url"`
	StorageProvider string    `json:"storage_provider"`
	SizeBytes       int       `json:"size_bytes"`
	Width           *int      `json:"width,omitempty"`
	Height          *int      `json:"height,omitempty"`
	AltText         *string   `json:"alt_text,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type UploadMediaInput struct {
	UploaderID *int64
	Filename   string // original filename
	MimeType   string
	SizeBytes  int
	Data       io.Reader
	Width      *int
	Height     *int
	AltText    *string
}

type MediaWrite struct {
	UploaderID      *int64
	Filename        string
	OriginalName    string
	MimeType        string
	URL             string
	StorageProvider string
	SizeBytes       int
	Width           *int
	Height          *int
	AltText         *string
}