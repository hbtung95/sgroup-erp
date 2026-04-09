package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// In a real production system, this would parse a JWT signature.
// For SGROUP ERP convention matching other modules, we are simulating JWT validation
// and injecting X-User-Role and X-User-ID for guard access.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{
					"code":    http.StatusUnauthorized,
					"message": "Missing or invalid Authorization header",
				},
			})
			c.Abort()
			return
		}

		// Mock token validation processing (usually jwt.Parse)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Dummies for test context
		var role, userID string
		if token == "mock-admin-token" {
			role = "admin"
			userID = "U001"
		} else if token == "mock-manager-token" {
			role = "project_manager"
			userID = "U002"
		} else if token == "mock-sales-token" {
			role = "sales"
			userID = "U003"
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{
					"code":    http.StatusUnauthorized,
					"message": "Invalid token",
				},
			})
			c.Abort()
			return
		}

		// Inject into context
		c.Set("role", role)
		c.Set("userID", userID)

		c.Next()
	}
}

// RoleGuard is a middleware that restricts access to the specified roles
func RoleGuard(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": gin.H{
					"code":    http.StatusForbidden,
					"message": "Role not found in context",
				},
			})
			c.Abort()
			return
		}

		roleStr := role.(string)
		isAllowed := false
		for _, requiredRole := range allowedRoles {
			if roleStr == requiredRole {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{
				"error": gin.H{
					"code":    http.StatusForbidden,
					"message": "You don't have permission to perform this action",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
