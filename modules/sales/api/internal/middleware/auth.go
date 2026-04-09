package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware - extracts standard User context from Auth token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": map[string]interface{}{"code": 401, "message": "Missing Authorization header"}})
			c.Abort()
			return
		}

		// Mocking standard JWT behaviour
		tokenStr := strings.TrimPrefix(token, "Bearer ")
		
		switch tokenStr {
		case "mock-admin-token":
			c.Set("userID", "admin-123")
			c.Set("role", "admin")
			c.Set("teamID", "global")
		case "mock-director-token":
			c.Set("userID", "dir-123")
			c.Set("role", "sales_director")
			c.Set("teamID", "global")
		case "mock-manager-token":
			c.Set("userID", "mgr-456")
			c.Set("role", "sales_manager")
			c.Set("teamID", "team-alpha")
		case "mock-staff-token":
			c.Set("userID", "staff-789")
			c.Set("role", "sales_staff")
			c.Set("teamID", "team-alpha")
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": map[string]interface{}{"code": 401, "message": "Invalid token"}})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RoleGuard - Restricts access up to highest role allowed
func RoleGuard(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": map[string]interface{}{"code": 401, "message": "Unauthorized"}})
			c.Abort()
			return
		}

		roleStr := role.(string)
		for _, allowed := range allowedRoles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": map[string]interface{}{"code": 403, "message": "Bị cấm! Quyền của bạn không đủ để thực hiện thao tác này."}})
		c.Abort()
	}
}
