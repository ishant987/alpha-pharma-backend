/**
 * Wrapper for async route handlers to catch errors and pass them to error handler middleware.
 * This simplifies route implementations by removing repetitive try-catch blocks.
 *
 * @param {Function} fn - The asynchronous function (route handler) to wrap.
 * @returns {Function} - A wrapped function for Express.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
