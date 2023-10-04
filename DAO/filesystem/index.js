const { Router } = require('express');
const products_router = require('./ProductFsDAO.js');
const carts_router = require('./CartFsDAO.js');

const router = Router();

router.use('/api/products', products_router);
router.use('/api/carts', carts_router);

module.exports = router;