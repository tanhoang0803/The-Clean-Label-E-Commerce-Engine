/**
 * Frontend product service.
 * Contains pure business/presentation logic — no API calls.
 * API calls live in the Redux thunks (productSlice.js).
 */

/**
 * Formats a price number as a USD currency string.
 *
 * @param {number} price
 * @returns {string} e.g. "$12.99"
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(Number(price))) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

/**
 * Filters a product list to only include safe products.
 *
 * @param {object[]} products
 * @returns {object[]}
 */
export function filterSafeProducts(products) {
  return products.filter((p) => p.is_safe === true);
}

/**
 * Sorts products by creation date, newest first.
 *
 * @param {object[]} products
 * @returns {object[]} New sorted array (does not mutate)
 */
export function sortByNewest(products) {
  return [...products].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

/**
 * Calculates the total price for a cart.
 *
 * @param {Array<{ price: number, quantity: number }>} items
 * @returns {number}
 */
export function calculateCartTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

/**
 * Returns a short excerpt of the ingredient list (first N characters).
 *
 * @param {string} ingredients
 * @param {number} [maxLength=80]
 * @returns {string}
 */
export function excerptIngredients(ingredients, maxLength = 80) {
  if (!ingredients) return '';
  if (ingredients.length <= maxLength) return ingredients;
  return ingredients.slice(0, maxLength).trimEnd() + '...';
}
