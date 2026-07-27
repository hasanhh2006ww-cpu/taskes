// ─── Request Validation Middleware ─────────────────────────

const { ValidationError } = require('../lib/errors');

/**
 * Validate request body against a Zod schema
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      const error = new ValidationError('Validation failed');
      error.errors = errors;
      return next(error);
    }
    // Replace with parsed (and transformed) data
    req[source] = result.data;
    next();
  };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return validate(schema, 'query');
}

/**
 * Validate URL params
 */
function validateParams(schema) {
  return validate(schema, 'params');
}

module.exports = { validate, validateQuery, validateParams };
