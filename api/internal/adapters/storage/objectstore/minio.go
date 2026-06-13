package objectstore

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/url"
	"strings"

	"apcms/internal/adapters/config"
	"apcms/internal/core/ports/output"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// publicReadPolicy allows anonymous GetObject on the uploads/ prefix so media
// URLs are directly accessible.
func publicReadPolicy(bucket string) string {
	return fmt.Sprintf(`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/uploads/*"]}]}`, bucket)
}

type minioStorage struct {
	client   *minio.Client
	bucket   string
	endpoint string // scheme + host, used to build public URLs
	secure   bool
}

// NewMinioStorage builds an output.FileStorage backed by S3/MinIO and ensures
// the target bucket exists.
func NewMinioStorage(cfg *config.S3) (output.FileStorage, error) {
	u, err := url.Parse(cfg.Endpoint)
	if err != nil {
		return nil, fmt.Errorf("invalid S3 endpoint: %w", err)
	}
	secure := u.Scheme == "https"

	client, err := minio.New(u.Host, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: secure,
		Region: cfg.Region,
	})
	if err != nil {
		return nil, err
	}

	s := &minioStorage{
		client:   client,
		bucket:   cfg.Bucket,
		endpoint: strings.TrimRight(cfg.Endpoint, "/"),
		secure:   secure,
	}

	exists, err := client.BucketExists(context.Background(), cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("checking bucket: %w", err)
	}
	if !exists {
		if err := client.MakeBucket(context.Background(), cfg.Bucket, minio.MakeBucketOptions{Region: cfg.Region}); err != nil {
			return nil, fmt.Errorf("creating bucket: %w", err)
		}
	}

	// Best-effort: make the uploads/ prefix publicly readable so media URLs work.
	if err := client.SetBucketPolicy(context.Background(), cfg.Bucket, publicReadPolicy(cfg.Bucket)); err != nil {
		log.Printf("[WARN] could not set public-read policy on bucket %q: %v", cfg.Bucket, err)
	}

	return s, nil
}

func (s *minioStorage) Upload(ctx context.Context, key string, body io.Reader, size int64, contentType string) (string, error) {
	_, err := s.client.PutObject(ctx, s.bucket, key, body, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}
	// Path-style public URL: {endpoint}/{bucket}/{key}
	return fmt.Sprintf("%s/%s/%s", s.endpoint, s.bucket, key), nil
}
