package image

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"

	"github.com/chai2010/webp"
)

const DefaultQuality = 80

// ConvertToWebP decodes any JPEG/PNG/GIF from r and re-encodes it as WebP.
// quality is 0–100; pass DefaultQuality if unsure.
func ConvertToWebP(r io.Reader, quality float32) ([]byte, error) {
	if quality < 0 || quality > 100 {
		return nil, fmt.Errorf("image: quality must be 0–100, got %.0f", quality)
	}

	img, _, err := image.Decode(r)
	if err != nil {
		return nil, fmt.Errorf("image: decode source: %w", err)
	}

	var buf bytes.Buffer
	if err := webp.Encode(&buf, img, &webp.Options{Lossless: false, Quality: quality}); err != nil {
		return nil, fmt.Errorf("image: encode webp: %w", err)
	}

	return buf.Bytes(), nil
}
