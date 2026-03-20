const productService = require('../services/productService');

/**
 * GET /api/products
 * Returns all products. Supports ?safe_only=true query param.
 */
async function getProducts(req, res, next) {
  try {
    const filters = {
      safe_only: req.query.safe_only,
    };
    const products = await productService.getAllProducts(filters);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Returns a single product by ID.
 */
async function getProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Creates a new product. Requires JWT (authenticateToken applied in routes/products.js).
 * Triggers OpenAI ingredient audit before saving.
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, image_url, ingredients } = req.body;

    if (!name || !ingredients || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'name, price, and ingredients are required',
      });
    }

    const product = await productService.createProduct({
      name,
      description,
      price,
      image_url,
      ingredients,
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct, createProduct };
