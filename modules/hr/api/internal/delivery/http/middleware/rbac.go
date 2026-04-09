package middleware

import (
	"encoding/json"
	"bytes"
	"net/http"

	"github.com/gin-gonic/gin"
)

// In a real scenario, roles would be extracted from the JWT passed via Authorization header.
// For demonstration of the RBAC concept, we'll simulate reading a "X-User-Role" header.
func FieldLevelRBAC() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetHeader("X-User-Role")

		// Let the request process normally by writing to a custom response writer
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		c.Next() // Process request

		// Intercept the response if it's a successful JSON response
		if c.Writer.Status() == http.StatusOK || c.Writer.Status() == http.StatusCreated {
			responseBody := blw.body.Bytes()
			
			// If role is NOT 'CB_Admin', we mask the sensitive salary fields
			if role != "CB_Admin" && len(responseBody) > 0 {
				var data map[string]interface{}
				if err := json.Unmarshal(responseBody, &data); err == nil {
					maskSensitiveFields(data)
					modifiedResponse, _ := json.Marshal(data)
					blw.ResponseWriter.Write(modifiedResponse)
					return
				}
			}
		}

		// Write original body if no masking occurred
		blw.ResponseWriter.Write(blw.body.Bytes())
	}
}

// maskSensitiveFields recursively looks for "salary" or "base_salary" keys and masks them.
func maskSensitiveFields(data interface{}) {
	switch v := data.(type) {
	case map[string]interface{}:
		for key, val := range v {
			if key == "salary" || key == "base_salary" || key == "net_salary" {
				v[key] = "*** HIDDEN (RBAC) ***"
			} else {
				maskSensitiveFields(val)
			}
		}
	case []interface{}:
		for _, item := range v {
			maskSensitiveFields(item)
		}
	}
}

// Custom ResponseWriter to intercept body
type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return len(b), nil
}
