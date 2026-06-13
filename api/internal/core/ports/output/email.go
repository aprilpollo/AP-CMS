package output

import "context"

// EmailSender dispatches an email (delegated to the external mail service).
type EmailSender interface {
	Send(ctx context.Context, to []string, subject, body string) error
}
