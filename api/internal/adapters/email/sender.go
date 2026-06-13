package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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

// NewClient returns an output.EmailSender that talks to the mail microservice
// (POST {baseURL}/api/send, expects HTTP 202).
func NewClient(baseURL string) output.EmailSender {
	return &client{
		sendURL: strings.TrimRight(baseURL, "/") + "/api/send",
		http:    &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *client) Send(ctx context.Context, to []string, subject, body string) error {
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
		return fmt.Errorf("mail service returned status %d", resp.StatusCode)
	}
	return nil
}
