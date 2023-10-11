const Product = require('../models/ProductModel');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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

const generateId = (items) => {
  const ids = items.map((i) => i.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
};

const readItemsFromFile = (filePath) => {
  try {
      const itemsJson = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(itemsJson);
  } catch (error) {
      console.error(error);
      return [];
  }
};

const saveItemsToFile = (items, filePath) => {
  const itemsJson = JSON.stringify(items);
  fs.writeFileSync(filePath, itemsJson, 'utf-8');
};

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ status: err.status || 500, response: err.message });
};

const generateMockProducts = (count) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      title: `Product ${i}`,
      description: `Description for Product ${i}`,
      code: `P${i}`,
      price: Math.floor(Math.random() * 999),
      stock: Math.floor(Math.random() * 999),
      category: `Category ${Math.floor(Math.random() * 10)}`,
      thumbnails: [],
    });
  }
  return products;
}

module.exports = {
    sendRealTimeProductsUpdate,
    countProducts,
    calculateTotalPrice,
    getPaginatedProducts,
    createToken,
    verifyToken,
    transport,
    generateUniqueCode,
    readItemsFromFile,
    generateId,
    saveItemsToFile,
    generateMockProducts
};