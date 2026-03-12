/**
 * Paginated response helper — wraps any service query result with pagination metadata.
 * Usage in service: return paginateResponse(data, total, page, limit);
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function paginateResponse<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 20,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Helper to extract skip/take from PaginationDto for Prisma queries.
 */
export function paginationToSkipTake(page = 1, limit = 20) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
