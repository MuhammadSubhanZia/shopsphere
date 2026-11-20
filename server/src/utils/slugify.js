/** "Pet Care & Toys" -> "pet-care-and-toys" (used as the category slug in URLs and filters) */
export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
