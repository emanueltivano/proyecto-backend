const express = require('express');
const router = express.Router();
const CartManager = require('../dao/mongodb/CartManager');

router.get('/:cid', async (req, res, next) => {
  const { cid } = req.params;
  try {
    const cart = await CartManager.getCartById(cid);
    res.json({ status: 200, response: cart });
  } catch (error) {
    res.status(404).json({ status: 404, response: error.message });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json({ status: 201, response: newCart });
  } catch (error) {
    res.status(400).json({ status: 400, response: error.message });
  }
});

router.post('/:cid/product/:pid', async (req, res, next) => {
  const { cid, pid } = req.params;
  try {
    const cart = await CartManager.addProductToCart(cid, pid);
    res.status(200).json({ status: 200, response: cart });
  } catch (error) {
    res.status(404).json({ status: 404, response: error.message });
  }
});

module.exports = router;