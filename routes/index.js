// routes/index.js
const express = require('express');
const router = express.Router();
const { sendRealTimeProductsUpdate } = require('../utils');
const ProductManager = require('../dao/mongodb/ProductManager');
const CartManager = require('../dao/mongodb/CartManager');
const ProductRouter = require('./ProductRouter');
const CartRouter = require('./CartRouter');
const { calculateTotalPages, getPaginatedProducts } = require('../dao/mongodb/ProductManager');

router.use('/api/products', ProductRouter);
router.use('/api/carts', CartRouter);

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

// Ruta para mostrar la vista de productos con paginación
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filters = {};
    if (query) {
      filters.category = query;
    }

    const sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1;
    } else if (sort === 'desc') {
      sortOptions.price = -1;
    }

    const productsResponse = await ProductManager.getPaginatedProducts(filters, sortOptions, parseInt(limit), parseInt(page));

    const prevLink = productsResponse.prevLink
      ? `/products?limit=${limit}&page=${parseInt(page) - 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    const nextLink = productsResponse.nextLink
      ? `/products?limit=${limit}&page=${parseInt(page) + 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    res.render('products', {
      products: productsResponse.products,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  } catch (error) {
    res.status(500).send('Error retrieving products from database.');
  }
});

router.get('/carts/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await CartManager.getCartById(cid);
    console.log(cart)
    res.render('carts', { cart });
  } catch (error) {
    res.status(404).send('Cart not found.');
  }
});

module.exports = router;