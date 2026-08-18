package email

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"apcms/internal/core/ports/output"
)

type sendRequest struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Body    string   `json:"body"`
}

type client struct {
	sendURL string
	http    *http.Client
}

// ErrNotConfigured is returned by every Send when EMAIL_SERVICE_URL is unset,
// instead of firing a request at a URL that cannot resolve.
var ErrNotConfigured = errors.New("email service is not configured (EMAIL_SERVICE_URL)")

// NewClient returns an output.EmailSender that talks to the mail microservice
// (POST {baseURL}/api/send, expects HTTP 202).
func NewClient(baseURL string) output.EmailSender {
	trimmed := strings.TrimRight(strings.TrimSpace(baseURL), "/")
	if trimmed == "" {
		log.Printf("[WARN] email: EMAIL_SERVICE_URL is empty — outgoing mail is disabled")
		return &client{}
	}
	return &client{
		sendURL: trimmed + "/api/send",
		http:    &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *client) Send(ctx context.Context, to []string, subject, body string) error {
	if c.sendURL == "" {
		log.Printf("[WARN] email: dropped %q to %v — service not configured", subject, to)
		return ErrNotConfigured
	}

	buf, err := json.Marshal(sendRequest{To: to, Subject: subject, Body: body})
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.sendURL, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {
		snippet, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		log.Printf("[ERROR] email: %s returned %d: %s", c.sendURL, resp.StatusCode, strings.TrimSpace(string(snippet)))
		return fmt.Errorf("mail service returned status %d", resp.StatusCode)
	}
	return nil
}
