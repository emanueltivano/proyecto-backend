const CartRepository = require('../repositories/CartRepository');

class CartController {
  async getCartById(req, res) {
    const { cid } = req.params;
    try {
      const cart = await CartRepository.getCartById(cid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }

  async createCart(req, res) {
    try {
      const newCart = await CartRepository.createCart();
      res.status(201).json({ status: 201, response: newCart });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  }

  async addProductToCart(req, res) {
    const { cid, pid } = req.params;
    const userEmail = req.session.user.email; // Obtener el correo electrónico del usuario autenticado
    try {
      const cart = await CartRepository.addProductToCart(cid, pid, userEmail);
      res.status(200).json({ status: 200, response: cart });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  }

  async removeProductFromCart(req, res) {
    const { cid, pid } = req.params;
    try {
      const cart = await CartRepository.removeProductFromCart(cid, pid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }

  async updateCart(req, res) {
    const { cid } = req.params;
    const { products } = req.body;
    try {
      const cart = await CartRepository.updateCart(cid, products);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  }

  async updateProductUnits(req, res) {
    const { cid, pid } = req.params;
    const { units } = req.body;
    try {
      const cart = await CartRepository.updateProductUnits(cid, pid, units);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }

  async removeAllProductsFromCart(req, res) {
    const { cid } = req.params;
    try {
      const cart = await CartRepository.removeAllProductsFromCart(cid);
      res.json({ status: 200, response: cart });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }

  async finishPurchase(req, res) {
    const { cid } = req.params;
    try {
      const ticket = await CartRepository.finishPurchase(cid, req);
      res.json({ status: 200, response: ticket });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }
};

module.exports = new CartController();