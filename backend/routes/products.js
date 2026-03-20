const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/products — public
router.get('/', productController.getProducts);

// GET /api/products/:id — public
router.get('/:id', productController.getProduct);

// POST /api/products — requires authentication
router.post('/', authenticateToken, productController.createProduct);

module.exports = router;
