package output

import (
	"context"
	"time"
)

// Cache is a small key/value cache abstraction (Redis).
type Cache interface {
	Get(ctx context.Context, key string) ([]byte, bool, error)
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
	Incr(ctx context.Context, key string) (int64, error)
}
