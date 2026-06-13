package slug

import (
	"regexp"
	"strings"
)

var nonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

// Make converts a title into a URL slug. Returns "" when the input has no
// ASCII alphanumerics (e.g. a purely Thai title) — callers should fall back.
func Make(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonAlnum.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}
