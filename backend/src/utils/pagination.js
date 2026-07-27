// ─── Pagination Utility ────────────────────────────────────

/**
 * Build pagination metadata
 */
function buildPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

/**
 * Parse pagination query parameters with defaults
 */
function parsePagination(query, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Parse sort parameters
 */
function parseSort(query, defaultField = 'createdAt', defaultOrder = 'desc') {
  const allowedFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'order'];
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : defaultOrder;
  return { sortBy, sortOrder };
}

module.exports = { buildPaginationMeta, parsePagination, parseSort };
