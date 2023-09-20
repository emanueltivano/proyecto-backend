const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// Rutas utilizando controladores
router.get('/', ProductController.getAllProducts);
router.get('/:pid', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:pid', ProductController.updateProduct);
router.delete('/:pid', ProductController.deleteProduct);

module.exports = router;