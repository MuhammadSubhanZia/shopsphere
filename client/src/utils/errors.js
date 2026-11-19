/**
 * Turns whatever a rejected thunk throws into text for the UI.
 * unwrap() throws the string passed to rejectWithValue, or an Error object for unexpected failures.
 */
export const getErrorMessage = (error) =>
  typeof error === 'string' ? error : error?.message || 'Something went wrong. Please try again.';
