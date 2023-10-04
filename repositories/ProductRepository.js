const ProductDAO = require('../DAO/mongodb/ProductDAO');

class ProductRepository {
  async getAllProducts(limit) {
    return await ProductDAO.getAllProducts(limit);
  }

  async getProductById(id) {
    return await ProductDAO.getProductById(id);
  }
  
  async createProduct(newProductData) {
    return await ProductDAO.createProduct(newProductData);
  }
  
  async updateProduct(id, updatedProductData) {
    return await ProductDAO.updateProduct(id, updatedProductData);
  }
  
  async deleteProduct(id) {
    return await ProductDAO.deleteProduct(id);
  }
}

module.exports = new ProductRepository();