/**
 * Shared `toJSON` options for every model.
 * The API exposes the numeric `id` the React app already uses, so MongoDB's
 * internal `_id`, the version key and secret fields are removed from responses.
 */
export const cleanJson = {
  versionKey: false,
  transform(doc, ret) {
    delete ret._id;
    delete ret.passwordHash;
    delete ret.updatedAt;
    return ret;
  },
};
