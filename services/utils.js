const fs = require('fs');

const sendRealTimeProductsUpdate = (io, products) => {
    io.emit('productsUpdate', products);
};

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

module.exports = {
    sendRealTimeProductsUpdate,
    readItemsFromFile,
    generateId,
    errorHandler,
    saveItemsToFile
};