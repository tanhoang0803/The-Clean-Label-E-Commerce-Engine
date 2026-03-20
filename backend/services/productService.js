const productRepository = require('../repositories/productRepository');
const aiService = require('./aiService');

/**
 * Creates a new product.
 * Runs the AI ingredient audit before persisting to the database.
 *
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.description
 * @param {number} data.price
 * @param {string} [data.image_url]
 * @param {string} data.ingredients - Raw ingredient list string
 * @param {number} data.created_by - User ID of the submitter
 * @returns {Promise<object>} The created product record including AI audit fields
 */
async function createProduct(data) {
  const { name, description, price, image_url, ingredients, created_by } = data;

  if (!name || !ingredients || price === undefined) {
    const err = new Error('name, ingredients, and price are required');
    err.status = 400;
    throw err;
  }

  // Run the AI audit — result is stored with the product, never re-computed on reads
  const auditResult = await aiService.analyzeIngredients(ingredients);

  const productData = {
    name,
    description: description || '',
    price: parseFloat(price),
    image_url: image_url || null,
    ingredients,
    is_safe: auditResult.is_safe,
    ai_reason: auditResult.reason,
    ai_checked_at: new Date(),
    created_by,
  };

  const product = await productRepository.create(productData);
  return { ...product, flagged_ingredients: auditResult.flagged_ingredients };
}

/**
 * Returns all products. Optionally filtered to safe-only.
 *
 * @param {object} [filters]
 * @param {boolean} [filters.safe_only] - If true, only return products where is_safe = true
 * @returns {Promise<object[]>}
 */
async function getAllProducts(filters = {}) {
  return productRepository.findAll(filters);
}

/**
 * Returns a single product by ID.
 *
 * @param {number} id
 * @returns {Promise<object>}
 */
async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return product;
}

module.exports = { createProduct, getAllProducts, getProductById };
