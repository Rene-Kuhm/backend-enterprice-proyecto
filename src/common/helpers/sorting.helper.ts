export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SortingHelper {
  static buildOrderBy(
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Record<string, unknown> {
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    // Handle nested sorting (e.g., "user.name")
    if (sortBy.includes('.')) {
      const [relation, field] = sortBy.split('.');
      return {
        [relation]: {
          [field]: validSortOrder,
        },
      };
    }

    return {
      [sortBy]: validSortOrder,
    };
  }

  static validateSortField(field: string, allowedFields: string[]): string {
    if (!allowedFields.includes(field)) {
      return 'createdAt'; // Default fallback
    }
    return field;
  }
}
