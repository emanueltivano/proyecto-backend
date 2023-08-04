const Product = require('../models/ProductModel');

const getAllProducts = async (limit) => {
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
};

const getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    return product;
  } catch (error) {
    throw new Error(`Product with id ${id} not found.`);
  }
};

const createProduct = async (newProductData) => {
  try {
    const newProduct = new Product(newProductData);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error(error); 
    throw new Error('Error creating product.');
  }
};

const updateProduct = async (id, updatedProductData) => {
  try {
    const product = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });
    return product;
  } catch (error) {
    throw new Error(`Product with id ${id} not found.`);
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    return product;
  } catch (error) {
    throw new Error(`Product with id ${id} not found.`);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};