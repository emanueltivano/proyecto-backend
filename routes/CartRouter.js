const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

// Rutas utilizando controladores
router.get('/:cid', CartController.getCartById);
router.post('/', CartController.createCart);
router.post('/:cid/products/:pid', CartController.addProductToCart);
router.delete('/:cid/products/:pid', CartController.removeProductFromCart);
router.put('/:cid', CartController.updateCart);
router.put('/:cid/products/:pid', CartController.updateProductUnits);
router.delete('/:cid', CartController.removeAllProductsFromCart);

module.exports = router;