const Cart = require('../models/CartModel');

const getCartById = async (cid) => {
  try {
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    return cart.toObject();
  } catch (error) {
    throw new Error(`Error fetching cart: ${error.message}`);
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

    const existingProduct = cart.products.find((p) => p.product && p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.units += 1;
    } else {
      const newProduct = { product: pid, units: 1 };
      cart.products.push(newProduct);
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeProductFromCart = async (cid, pid) => {
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    cart.products = cart.products.filter((p) => p.product && p.product.toString() !== pid);

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateCart = async (cid, newProducts) => {
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    cart.products = newProducts;

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateProductUnits = async (cid, pid, units) => {
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    const existingProduct = cart.products.find((p) => p.product && p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.units = units;
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeAllProductsFromCart = async (cid) => {
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      throw new Error(`Cart with id ${cid} not found.`);
    }

    cart.products = [];

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
  removeProductFromCart,
  updateCart,
  updateProductUnits,
  removeAllProductsFromCart
};