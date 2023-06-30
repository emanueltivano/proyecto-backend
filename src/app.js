const express = require('express');
const ProductManager = require('./ProductManager');

const app = express();
const productManager = new ProductManager('src/products.json');

app.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const products = await productManager.getProducts();

    if (Number.isNaN(limit)) {
      res.json(products);
    } else {
      res.json(products.slice(0, limit));
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(8080, () => {
  console.log('Server is running on port 8080.');
});