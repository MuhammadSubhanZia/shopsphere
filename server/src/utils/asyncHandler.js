/** Lets route handlers be `async` functions: a rejected promise is passed on to next(err). */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
