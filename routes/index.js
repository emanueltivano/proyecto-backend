const express = require('express');
const router = express.Router();
const path = require('path');
const { readItemsFromFile, generateId, saveItemsToFile, sendRealTimeProductsUpdate, errorHandler } = require('../utils');
const ProductManager = require('../dao/mongodb/ProductManager');

router.get('/', async (req, res) => {
  try {
    const products = await ProductManager.getAllProducts();
    const productsData = products.map((product) => product.toObject());
    res.render('home', { products: productsData });
  } catch (error) {
    res.status(500).send('Error retrieving products from database.');
  }
});

router.get('/chat', (req, res) => {
  res.render('chat');
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await ProductManager.getAllProducts();
    const productsData = products.map((product) => product.toObject());
    const newProduct = {}; // Crear un objeto vacío para newProduct
    res.render('realTimeProducts', { products: productsData, newProduct }); // Agregar newProduct al contexto
  } catch (error) {
    res.status(500).json({ status: 500, response: error.message });
  }
});

router.post('/api/products', async (req, res, next) => {
  const newProductData = req.body;
  try {
    const newProduct = await ProductManager.createProduct(newProductData);
    sendRealTimeProductsUpdate(req.io, newProduct);
    res.redirect('/realtimeproducts');
  } catch (error) {
    res.status(400).json({ status: 400, response: error.message });
  }
});

module.exports = router;