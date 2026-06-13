package cache

import (
	"context"
	"errors"
	"time"

	"apcms/internal/core/ports/output"

	"github.com/redis/go-redis/v9"
)

const (
	refreshPrefix   = "auth:refresh:"
	loginFailPrefix = "auth:loginfail:"
	resetPrefix     = "auth:reset:"
	emailPrefix     = "auth:emailverify:"
)

type sessionStore struct {
	client *redis.Client
}

// NewSessionStore returns an output.SessionStore backed by Redis.
func NewSessionStore(rc *RedisClient) output.SessionStore {
	return &sessionStore{client: rc.GetClient()}
}

func (s *sessionStore) SaveRefresh(ctx context.Context, token, userID string, ttl time.Duration) error {
	return s.client.Set(ctx, refreshPrefix+token, userID, ttl).Err()
}

func (s *sessionStore) GetRefreshUserID(ctx context.Context, token string) (string, error) {
	userID, err := s.client.Get(ctx, refreshPrefix+token).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return userID, err
}

func (s *sessionStore) DeleteRefresh(ctx context.Context, token string) error {
	return s.client.Del(ctx, refreshPrefix+token).Err()
}

func (s *sessionStore) LoginFailCount(ctx context.Context, ip string) (int64, error) {
	n, err := s.client.Get(ctx, loginFailPrefix+ip).Int64()
	if errors.Is(err, redis.Nil) {
		return 0, nil
	}
	return n, err
}

func (s *sessionStore) IncrLoginFail(ctx context.Context, ip string, ttl time.Duration) (int64, error) {
	key := loginFailPrefix + ip
	n, err := s.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if n == 1 {
		// first failure in the window — set the expiry
		_ = s.client.Expire(ctx, key, ttl).Err()
	}
	return n, nil
}

func (s *sessionStore) ResetLoginFail(ctx context.Context, ip string) error {
	return s.client.Del(ctx, loginFailPrefix+ip).Err()
}

func (s *sessionStore) SaveResetToken(ctx context.Context, token, userID string, ttl time.Duration) error {
	return s.client.Set(ctx, resetPrefix+token, userID, ttl).Err()
}

func (s *sessionStore) GetResetUserID(ctx context.Context, token string) (string, error) {
	userID, err := s.client.Get(ctx, resetPrefix+token).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return userID, err
}

func (s *sessionStore) DeleteResetToken(ctx context.Context, token string) error {
	return s.client.Del(ctx, resetPrefix+token).Err()
}

func (s *sessionStore) SaveEmailToken(ctx context.Context, token, value string, ttl time.Duration) error {
	return s.client.Set(ctx, emailPrefix+token, value, ttl).Err()
}

func (s *sessionStore) GetEmailToken(ctx context.Context, token string) (string, error) {
	value, err := s.client.Get(ctx, emailPrefix+token).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return value, err
}

func (s *sessionStore) DeleteEmailToken(ctx context.Context, token string) error {
	return s.client.Del(ctx, emailPrefix+token).Err()
}
