// ═══════════════════════════════════════════════════════════
// @sgroup/types — API Response Types
// Matches the go-kit/response package envelope format.
// ═══════════════════════════════════════════════════════════

/**
 * Standard success response envelope from all API modules.
 * Matches go-kit/response.SuccessResponse.
 */
export interface ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: PaginationMeta;
}

/** Pagination metadata for list endpoints. */
export interface PaginationMeta {
  readonly page: number;
  readonly page_size: number;
  readonly total: number;
  readonly total_pages: number;
}

/**
 * Standard error response envelope from all API modules.
 * Matches go-kit/response.ErrorResponse.
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiErrorDetail;
}

/** Machine-readable error detail. */
export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

/** Convenience alias for status breakdown aggregation. */
export interface StatusCount {
  readonly status: string;
  readonly count: number;
}

/** ISO 8601 date string type alias for documentation clarity. */
export type ISODateString = string;

/** UUID string type alias. */
export type UUID = string;
