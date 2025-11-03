export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
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

export class PaginationHelper {
  static getSkipTake(page: number = 1, limit: number = 10) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    return {
      skip: (validPage - 1) * validLimit,
      take: validLimit,
    };
  }

  static formatPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 10,
  ): PaginatedResult<T> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const totalPages = Math.ceil(total / validLimit);

    return {
      data,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    };
  }
}
