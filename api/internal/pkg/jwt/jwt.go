package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Manager issues and verifies HS256 access tokens.
type Manager struct {
	secret    []byte
	issuer    string
	accessTTL time.Duration
}

// Claims is the access-token payload.
type Claims struct {
	UserID string `json:"uid"`
	jwt.RegisteredClaims
}

func NewManager(secret, issuer string, accessTTL time.Duration) *Manager {
	return &Manager{secret: []byte(secret), issuer: issuer, accessTTL: accessTTL}
}

// AccessTTL returns the configured access-token lifetime.
func (m *Manager) AccessTTL() time.Duration { return m.accessTTL }

// Generate returns a signed access token for userID and its lifetime in seconds.
func (m *Manager) Generate(userID string) (string, int64, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.accessTTL)),
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(m.secret)
	if err != nil {
		return "", 0, err
	}
	return token, int64(m.accessTTL.Seconds()), nil
}

// Parse validates a token string and returns its claims.
func (m *Manager) Parse(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return m.secret, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
