export interface FilterParams {
  [key: string]: any;
}

export class FilteringHelper {
  static buildWhereClause(filters: FilterParams): any {
    const where: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      // Handle search (contains)
      if (key.endsWith('_search')) {
        const field = key.replace('_search', '');
        where[field] = {
          contains: value,
          mode: 'insensitive',
        };
        return;
      }

      // Handle range queries
      if (key.endsWith('_gte')) {
        const field = key.replace('_gte', '');
        where[field] = { ...where[field], gte: value };
        return;
      }

      if (key.endsWith('_lte')) {
        const field = key.replace('_lte', '');
        where[field] = { ...where[field], lte: value };
        return;
      }

      if (key.endsWith('_gt')) {
        const field = key.replace('_gt', '');
        where[field] = { ...where[field], gt: value };
        return;
      }

      if (key.endsWith('_lt')) {
        const field = key.replace('_lt', '');
        where[field] = { ...where[field], lt: value };
        return;
      }

      // Handle array contains
      if (Array.isArray(value)) {
        where[key] = { in: value };
        return;
      }

      // Default exact match
      where[key] = value;
    });

    return where;
  }

  static sanitizeFilters(filters: FilterParams): FilterParams {
    const sanitized: FilterParams = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}
