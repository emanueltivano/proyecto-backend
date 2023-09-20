const CartManager = require('../dao/CartManager');

const CartController = {
  getCartById: async (req, res) => {
    const { cid } = req.params;
    try {
      const cart = await CartManager.getCartById(cid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  },

  createCart: async (req, res) => {
    try {
      const newCart = await CartManager.createCart();
      res.status(201).json({ status: 201, response: newCart });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  },

  addProductToCart: async (req, res) => {
    const { cid, pid } = req.params;
    try {
      const cart = await CartManager.addProductToCart(cid, pid);
      res.status(200).json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  },

  // Eliminar un producto específico del carrito
  removeProductFromCart: async (req, res) => {
    const { cid, pid } = req.params;
    try {
      const cart = await CartManager.removeProductFromCart(cid, pid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  },

  // Actualizar el carrito con un arreglo de productos
  updateCart: async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
      const cart = await CartManager.updateCart(cid, products);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  },

  // Actualizar la cantidad de ejemplares de un producto en el carrito
  updateProductUnits: async (req, res) => {
    const { cid, pid } = req.params;
    const { units } = req.body;
    try {
      const cart = await CartManager.updateProductUnits(cid, pid, units);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  },

  // Eliminar todos los productos del carrito
  removeAllProductsFromCart: async (req, res) => {
    const { cid } = req.params;
    try {
      const cart = await CartManager.removeAllProductsFromCart(cid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  },
};

module.exports = CartController;