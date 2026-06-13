package output

import (
	"context"
	"io"
)

// FileStorage uploads binary objects to an object store (S3/MinIO) and returns
// a publicly accessible URL.
type FileStorage interface {
	Upload(ctx context.Context, key string, body io.Reader, size int64, contentType string) (url string, err error)
}
