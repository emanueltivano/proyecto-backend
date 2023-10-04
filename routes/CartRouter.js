const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/:cid', CartController.getCartById);
router.post('/', CartController.createCart);
router.post('/:cid/products/:pid', CartController.addProductToCart);
router.delete('/:cid/products/:pid', CartController.removeProductFromCart);
router.put('/:cid', CartController.updateCart);
router.put('/:cid/products/:pid/:units', CartController.updateProductUnits);
router.delete('/:cid', CartController.removeAllProductsFromCart);
router.post('/:cid/purchase', CartController.finishPurchase);

module.exports = router;