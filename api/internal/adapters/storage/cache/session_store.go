package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"sort"
	"time"

	"apcms/internal/core/domain"
	"apcms/internal/core/ports/output"

	"github.com/redis/go-redis/v9"
)

const (
	refreshPrefix   = "auth:refresh:"
	loginFailPrefix = "auth:loginfail:"
	resetPrefix     = "auth:reset:"
	emailPrefix     = "auth:emailverify:"
	sessionPrefix   = "auth:session:"    // auth:session:<userID>:<sessionID> → sessionRecord
	sessionIdxPref  = "auth:sessionidx:" // auth:sessionidx:<userID> → set of sessionIDs
)

// sessionRecord is what a signed-in device looks like in Redis. The refresh
// token stays server-side: the API only ever exposes the derived session id.
type sessionRecord struct {
	Token      string    `json:"token"`
	UserAgent  string    `json:"user_agent"`
	IP         string    `json:"ip"`
	CreatedAt  time.Time `json:"created_at"`
	LastSeenAt time.Time `json:"last_seen_at"`
}

// sessionID derives a stable, non-reversible id for a refresh token.
func sessionID(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])[:16]
}

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

func (s *sessionStore) TrackSession(ctx context.Context, userID, token, userAgent, ip string, ttl time.Duration) error {
	id := sessionID(token)
	now := time.Now().UTC()

	payload, err := json.Marshal(sessionRecord{
		Token:      token,
		UserAgent:  userAgent,
		IP:         ip,
		CreatedAt:  now,
		LastSeenAt: now,
	})
	if err != nil {
		return err
	}

	pipe := s.client.TxPipeline()
	pipe.Set(ctx, sessionPrefix+userID+":"+id, payload, ttl)
	pipe.SAdd(ctx, sessionIdxPref+userID, id)
	pipe.Expire(ctx, sessionIdxPref+userID, ttl)
	_, err = pipe.Exec(ctx)
	return err
}

func (s *sessionStore) TouchSession(ctx context.Context, userID, token string) error {
	key := sessionPrefix + userID + ":" + sessionID(token)

	raw, err := s.client.Get(ctx, key).Bytes()
	if errors.Is(err, redis.Nil) {
		return nil
	}
	if err != nil {
		return err
	}

	var rec sessionRecord
	if err := json.Unmarshal(raw, &rec); err != nil {
		return err
	}
	rec.LastSeenAt = time.Now().UTC()

	payload, err := json.Marshal(rec)
	if err != nil {
		return err
	}
	// KeepTTL: refreshing an access token must not extend the session window.
	return s.client.Set(ctx, key, payload, redis.KeepTTL).Err()
}

func (s *sessionStore) ListSessions(ctx context.Context, userID string) ([]domain.Session, error) {
	ids, err := s.client.SMembers(ctx, sessionIdxPref+userID).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, nil
		}
		return nil, err
	}

	sessions := make([]domain.Session, 0, len(ids))
	var stale []any
	for _, id := range ids {
		raw, err := s.client.Get(ctx, sessionPrefix+userID+":"+id).Bytes()
		if errors.Is(err, redis.Nil) {
			// The record expired; drop the dangling index entry.
			stale = append(stale, id)
			continue
		}
		if err != nil {
			return nil, err
		}

		var rec sessionRecord
		if err := json.Unmarshal(raw, &rec); err != nil {
			continue
		}
		sessions = append(sessions, domain.Session{
			ID:         id,
			UserAgent:  rec.UserAgent,
			IP:         rec.IP,
			CreatedAt:  rec.CreatedAt,
			LastSeenAt: rec.LastSeenAt,
		})
	}
	if len(stale) > 0 {
		_ = s.client.SRem(ctx, sessionIdxPref+userID, stale...).Err()
	}

	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].LastSeenAt.After(sessions[j].LastSeenAt)
	})
	return sessions, nil
}

func (s *sessionStore) DeleteSession(ctx context.Context, userID, id string) error {
	key := sessionPrefix + userID + ":" + id

	raw, err := s.client.Get(ctx, key).Bytes()
	if err != nil && !errors.Is(err, redis.Nil) {
		return err
	}
	if err == nil {
		var rec sessionRecord
		if json.Unmarshal(raw, &rec) == nil && rec.Token != "" {
			// Killing the session means killing the refresh token behind it.
			_ = s.client.Del(ctx, refreshPrefix+rec.Token).Err()
		}
	}

	pipe := s.client.TxPipeline()
	pipe.Del(ctx, key)
	pipe.SRem(ctx, sessionIdxPref+userID, id)
	_, err = pipe.Exec(ctx)
	return err
}

func (s *sessionStore) DeleteSessionByToken(ctx context.Context, userID, token string) error {
	return s.DeleteSession(ctx, userID, sessionID(token))
}
