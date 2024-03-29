const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware')

// Rutas utilizando controladores
router.get('/', authMiddleware, ProductController.getAllProducts);
router.get('/:pid', authMiddleware, ProductController.getProductById);
router.post('/', authMiddleware, roleMiddleware(['admin', 'premium']), ProductController.createProduct);
router.put('/:pid', authMiddleware, roleMiddleware(['admin', 'premium']), ProductController.updateProduct);
router.delete('/:pid', authMiddleware, roleMiddleware(['admin', 'premium']), ProductController.deleteProduct);

module.exports = router;