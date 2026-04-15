// Package response provides standardized JSON response helpers for all API modules.
//
// Usage:
//
//	response.OK(c, data)           → 200 { "success": true, "data": ... }
//	response.Created(c, data)      → 201
//	response.BadRequest(c, err)    → 400 { "success": false, "error": { ... } }
//	response.NotFound(c, msg)      → 404
//	response.ServerError(c, err)   → 500
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SuccessResponse is the standard envelope for successful operations.
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// Meta holds pagination and list metadata.
type Meta struct {
	Page       int   `json:"page,omitempty"`
	PageSize   int   `json:"page_size,omitempty"`
	Total      int64 `json:"total,omitempty"`
	TotalPages int   `json:"total_pages,omitempty"`
}

// ErrorResponse is the standard envelope for error responses.
type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   ErrorDetail `json:"error"`
}

// ErrorDetail provides machine-readable and human-readable error info.
type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Field   string `json:"field,omitempty"`
}

// ── Success Helpers ─────────────────────────────────────

// OK sends a 200 response with the given data.
func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Data:    data,
	})
}

// OKWithMeta sends a 200 response with data and pagination metadata.
func OKWithMeta(c *gin.Context, data interface{}, meta Meta) {
	c.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Data:    data,
		Meta:    &meta,
	})
}

// Created sends a 201 response with the newly created resource.
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, SuccessResponse{
		Success: true,
		Data:    data,
	})
}

// NoContent sends a 204 response with no body.
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// ── Error Helpers ───────────────────────────────────────

// BadRequest sends a 400 response.
func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "BAD_REQUEST",
			Message: message,
		},
	})
}

// ValidationError sends a 422 response for field-level validation failures.
func ValidationError(c *gin.Context, field, message string) {
	c.JSON(http.StatusUnprocessableEntity, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "VALIDATION_ERROR",
			Message: message,
			Field:   field,
		},
	})
}

// Unauthorized sends a 401 response.
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "UNAUTHORIZED",
			Message: message,
		},
	})
}

// Forbidden sends a 403 response.
func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "FORBIDDEN",
			Message: message,
		},
	})
}

// NotFound sends a 404 response.
func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "NOT_FOUND",
			Message: message,
		},
	})
}

// Conflict sends a 409 response.
func Conflict(c *gin.Context, message string) {
	c.JSON(http.StatusConflict, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "CONFLICT",
			Message: message,
		},
	})
}

// ServerError sends a 500 response. The actual error is logged, not exposed.
func ServerError(c *gin.Context, err error) {
	// TODO: integrate with structured logger
	c.JSON(http.StatusInternalServerError, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    "INTERNAL_ERROR",
			Message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
		},
	})
}
