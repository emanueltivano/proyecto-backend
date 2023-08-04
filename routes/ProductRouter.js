const express = require('express');
const router = express.Router();
const { sendRealTimeProductsUpdate } = require('../utils');
const ProductManager = require('../dao/mongodb/ProductManager');

router.get('/', async (req, res) => {
    const { limit } = req.query;
    try {
        const products = await ProductManager.getAllProducts(limit);
        res.json({ status: 200, response: products });
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

router.get('/:pid', async (req, res, next) => {
    const { pid } = req.params;
    try {
        const product = await ProductManager.getProductById(pid);
        res.json({ status: 200, response: product });
    } catch (error) {
        res.status(404).json({ status: 404, response: error.message });
    }
});

router.post('/', async (req, res, next) => {
    const newProductData = req.body;
    try {
        const newProduct = await ProductManager.createProduct(newProductData);

        // Obtener todos los productos actualizados después de la creación
        const products = await ProductManager.getAllProducts();

        // Emitir el evento de actualización de productos a todos los clientes conectados
        req.io.emit('productsUpdate', products);

        res.status(201).json({ status: 201, response: newProduct });
    } catch (error) {
        res.status(400).json({ status: 400, response: error.message });
    }
});

router.put('/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const updatedProductData = req.body;
    try {
        const updatedProduct = await ProductManager.updateProduct(pid, updatedProductData);

        // Obtener todos los productos actualizados después de la actualización
        const products = await ProductManager.getAllProducts();

        // Emitir el evento de actualización de productos a todos los clientes conectados
        req.io.emit('productsUpdate', products);

        res.json({ status: 200, response: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 400, response: error.message });
    }
});

router.delete('/:pid', async (req, res, next) => {
    const { pid } = req.params;
    try {
        const deletedProduct = await ProductManager.deleteProduct(pid);

        // Obtener todos los productos actualizados después de la eliminación
        const products = await ProductManager.getAllProducts();

        // Emitir el evento de actualización de productos a todos los clientes conectados
        req.io.emit('productsUpdate', products);

        res.json({ status: 200, response: deletedProduct });
    } catch (error) {
        res.status(404).json({ status: 404, response: error.message });
    }
});

module.exports = router;