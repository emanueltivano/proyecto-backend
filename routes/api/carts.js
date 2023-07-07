const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFilePath = './data/carts.json';

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

router.use(express.json());

router.get('/:cid', (req, res, next) => {
    const { cid } = req.params;
    const carts = readItemsFromFile(cartsFilePath);
    const cart = carts.find((c) => c.id === parseInt(cid));
    if (cart) {
        res.json({ status: 200, response: cart });
    } else {
        errorHandler({ status: 404, message: `Cart with id ${cid} not found.` }, req, res, next);
    }
});

router.post('/', (req, res) => {
    const carts = readItemsFromFile(cartsFilePath);
    const newCart = {
        id: generateId(carts),
        products: [],
    };
    carts.push(newCart);
    saveItemsToFile(carts, cartsFilePath);
    res.status(201).json({ status: 201, response: newCart });
});

router.post('/:cid/product/:pid', (req, res, next) => {
    const { cid, pid } = req.params;
    const carts = readItemsFromFile(cartsFilePath);
    const cart = carts.find((c) => c.id === parseInt(cid));
    if (cart) {
        const productId = parseInt(pid);
        const existingProduct = cart.products.find((p) => p.product === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            const newProduct = { product: productId, quantity: 1 };
            cart.products.push(newProduct);
        }
        saveItemsToFile(carts, cartsFilePath);
        res.status(200).json({ status: 200, response: cart });
    } else {
        errorHandler({ status: 404, message: `Cart with id ${cid} not found.` }, req, res, next);
    }
});

module.exports = router;