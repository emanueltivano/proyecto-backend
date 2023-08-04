const Cart = require('../models/CartModel');

const getCartById = async (cid) => {
  try {
    const cart = await Cart.findById(cid).populate('products.product', 'title description code price stock');
    return cart;
  } catch (error) {
    throw new Error(`Cart with id ${cid} not found.`);
  }
};

const createCart = async () => {
  try {
    const newCart = new Cart();
    await newCart.save();
    return newCart;
  } catch (error) {
    throw new Error('Error creating cart.');
  }
};

const addProductToCart = async (cid, pid) => {
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    const productId = parseInt(pid);
    const existingProduct = cart.products.find((p) => p.product && p.product._id.toString() === pid);
    if (existingProduct) {
      existingProduct.units += 1;
    } else {
      const newProduct = { product: productId, units: 1 };
      cart.products.push(newProduct);
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getCartById,
  createCart,
  addProductToCart,
};