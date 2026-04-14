package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
	"strings"
)

var secretKey []byte

func init() {
	key := os.Getenv("HR_PII_SECRET_KEY")
	if key == "" {
		// Fallback for dev only. DO NOT USE IN PRODUCTION!
		key = "super_secret_pii_key_for_hr_2026"
	}
	
	// Ensure key is 32 bytes for AES-256
	if len(key) >= 32 {
		secretKey = []byte(key[:32])
	} else {
		// pad it
		padded := key + strings.Repeat("0", 32-len(key))
		secretKey = []byte(padded)
	}
}

// EncryptPII encrypts sensitive Personal Identifiable Information
func EncryptPII(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptPII decrypts previously encrypted PII
func DecryptPII(cryptoText string) (string, error) {
	if cryptoText == "" {
		return "", nil
	}

	ciphertext, err := base64.StdEncoding.DecodeString(cryptoText)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err // Potentially an old unencrypted text if error? We handle it in hooks.
	}

	return string(plaintext), nil
}
