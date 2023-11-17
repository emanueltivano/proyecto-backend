const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:cid', CartController.getCartById);
router.post('/', CartController.createCart);
router.post('/:cid/products/:pid', CartController.addProductToCart);
router.delete('/:cid/products/:pid', CartController.removeProductFromCart);
router.put('/:cid', CartController.updateCart);
router.put('/:cid/products/:pid/:units', CartController.updateProductUnits);
router.delete('/:cid/products', CartController.removeAllProductsFromCart);
router.post('/:cid/purchase', authMiddleware, roleMiddleware('user'), CartController.finishPurchase);

module.exports = router;