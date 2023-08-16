const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/mongodb/ProductManager');

// Función para calcular el total de páginas
const calculateTotalPages = (totalCount, limit) => Math.ceil(totalCount / limit);

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filters = {};
    if (query) {
        // Agregar filtro por categoría o disponibilidad aquí
        filters.$or = [
            { category: query },
            { status: query === 'available' ? true : false }
        ];
    }

    const sortOptions = {};
    if (sort === 'asc') {
        sortOptions.price = 1;
    } else if (sort === 'desc') {
        sortOptions.price = -1;
    }

    try {
        const totalCount = await ProductManager.countProducts(filters);
        const totalPages = calculateTotalPages(totalCount, limit);

        const skip = (page - 1) * limit;
        const products = await ProductManager.getProducts(filters, sortOptions, limit, skip);

        const prevLink = page > 1 ? `/api/products?limit=${limit}&page=${parseInt(page) - 1}&sort=${sort}` : null;
        const nextLink = page < totalPages ? `/api/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}` : null;

        const response = {
            status: 'success',
            payload: products,
            totalPages,
            prevPage: page > 1 ? parseInt(page) - 1 : null,
            nextPage: page < totalPages ? parseInt(page) + 1 : null,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink,
            nextLink,
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ status: 'error', response: error.message });
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