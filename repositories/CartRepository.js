const CartDAO = require('../DAO/CartDAO');

class CartRepository {
  async getCartById(cid) {
    return await CartDAO.getCartById(cid);
  }

  async createCart() {
    return await CartDAO.createCart();
  }
  
  async addProductToCart(cid, pid) {
    return await CartDAO.addProductToCart(cid, pid);
  }
  
  async removeProductFromCart(cid, pid) {
    return await CartDAO.removeProductFromCart(cid, pid);
  }
  
  async updateCart(cid, newProducts) {
    return await CartDAO.updateCart(cid, newProducts);
  }
  
  async updateProductUnits(cid, pid, units) {
    return await CartDAO.updateProductUnits(cid, pid, units);
  }
  
  async removeAllProductsFromCart(cid) {
    return await CartDAO.removeAllProductsFromCart(cid);
  }
  
  async finishPurchase(cid, req) {
    return await CartDAO.finishPurchase(cid, req);
  }
}

module.exports = new CartRepository();