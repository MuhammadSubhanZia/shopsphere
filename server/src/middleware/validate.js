import { ApiError } from '../utils/ApiError.js';

/**
 * Route middleware factory:  router.post('/login', validate(validateLogin), login)
 * Runs a validator on req.body and rejects with 400 and the list of field errors.
 */
export const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body);
  if (Object.keys(errors).length > 0) {
    return next(new ApiError(Object.values(errors)[0], 400, errors));
  }
  next();
};
