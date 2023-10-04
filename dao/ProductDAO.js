const Product = require('../models/ProductModel');

class ProductDAO {
  async getAllProducts(limit) {
    try {
      let products;
      if (limit) {
        products = await Product.find().limit(parseInt(limit));
      } else {
        products = await Product.find();
      }
      return products;
    } catch (error) {
      throw new Error('Error retrieving products from database.');
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      throw new Error(`Product with id ${id} not found.`);
    }
  }

  async createProduct(newProductData) {
    try {
      const newProduct = new Product(newProductData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error(error); 
      throw new Error('Error creating product.');
    }
  }

  async updateProduct(id, updatedProductData) {
    try {
      const product = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });
      return product;
    } catch (error) {
      throw new Error(`Product with id ${id} not found.`);
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      return product;
    } catch (error) {
      throw new Error(`Product with id ${id} not found.`);
    }
  }
}

module.exports = new ProductDAO();