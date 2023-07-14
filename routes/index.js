const express = require('express');
const router = express.Router();
const path = require('path');
const { readItemsFromFile, generateId, saveItemsToFile, sendRealTimeProductsUpdate, errorHandler } = require('./api/products');

router.get('/', (req, res) => {
  const productsFilePath = path.join(__dirname, '../data/products.json');
  const products = readItemsFromFile(productsFilePath);
  res.render('home', { products });
});

router.get('/realtimeproducts', (req, res) => {
  const productsFilePath = path.join(__dirname, '../data/products.json');
  const products = readItemsFromFile(productsFilePath);
  const newProduct = {}; // Crear un objeto vacío para newProduct
  res.render('realTimeProducts', { products, newProduct }); // Agregar newProduct al contexto
});

router.post('/api/products', (req, res, next) => {
  const productsFilePath = path.join(__dirname, '../data/products.json');
  const products = readItemsFromFile(productsFilePath);
  const newProduct = {
    id: generateId(products),
    title: req.body.title,
    description: req.body.description,
    code: req.body.code,
    price: req.body.price,
    status: true,
    stock: req.body.stock,
    category: req.body.category,
    thumbnails: req.body.thumbnails || [],
  };

  if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    errorHandler({ status: 400, message: 'All fields are required.' }, req, res, next);
  } else {
    const productWithSameCode = products.find(p => p.code === newProduct.code);
    if (productWithSameCode) {
      errorHandler({ status: 400, message: 'Product code already exists.' }, req, res, next);
    } else {
      products.push(newProduct);
      saveItemsToFile(products, productsFilePath);
      sendRealTimeProductsUpdate(req.io, products);
      res.redirect('/realtimeproducts');
    }
  }
});

module.exports = router;