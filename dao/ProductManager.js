const Product = require('../models/ProductModel');

const calculateTotalPages = (totalCount, limit) => Math.ceil(totalCount / limit);

const getPaginatedProducts = async (filters, sortOptions, limit, page) => {
  try {
    const skip = (page - 1) * limit;
    const totalCount = await countProducts(filters);
    const totalPages = calculateTotalPages(totalCount, limit);
    const products = await getProducts(filters, sortOptions, limit, skip);
    
    const response = {
      products: products.map(product => product.toObject()), // Convertir a objetos para asegurar que las propiedades sean propias
      prevLink: page > 1 ? `/?limit=${limit}&page=${page - 1}` : null,
      nextLink: page < totalPages ? `/?limit=${limit}&page=${page + 1}` : null,
    };
    
    return response;
  } catch (error) {
    throw new Error('Error retrieving paginated products from database.');
  }
};

const countProducts = async (filters) => {
  try {
    const count = await Product.countDocuments(filters);
    return count;
  } catch (error) {
    throw new Error('Error counting products in database.');
  }
};

const getProducts = async (filters, sortOptions, limit, skip) => {
  try {
    const products = await Product.find(filters)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip);
    return products;
  } catch (error) {
    throw new Error('Error retrieving products from database.');
  }
};

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
  calculateTotalPages,
  getPaginatedProducts,
  countProducts,
  getProducts,
};