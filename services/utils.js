const Product = require('../models/ProductModel');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');

const sendRealTimeProductsUpdate = (io, products) => {
    io.emit('productsUpdate', products);
};

const calculateTotalPrice = (cart) => {
    return cart.products.reduce((total, product) => {
        return total + (product.product.price * product.units);
    }, 0);
};

const calculateTotalPages = (totalCount, limit) => Math.ceil(totalCount / limit);

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

const createToken = (userId) => {
  return jwt.sign({ id: userId }, config.secretKey, {
      expiresIn: "1h",
  });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
      jwt.verify(token, config.secretKey, (err, decodedToken) => {
          if (err) {
              reject(err);
          } else {
              resolve(decodedToken);
          }
      });
  });
};

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: config.gmailUser,
    pass: config.gmailPassword
  }
});

function generateUniqueCode() {
  return uuidv4();
}

module.exports = {
    sendRealTimeProductsUpdate,
    calculateTotalPrice,
    getPaginatedProducts,
    createToken,
    verifyToken,
    transport,
    generateUniqueCode
};