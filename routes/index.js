const express = require('express');
const router = express.Router();
const CartDAO = require('../DAO/mongodb/CartDAO');
const ProductDAO = require('../DAO/mongodb/ProductDAO');

const CartRouter = require('./CartRouter');
const ProductRouter = require('./ProductRouter');
const SessionRouter = require('./SessionRouter');

const twilio = require('twilio');
const config = require('../config/config')
const cookieParser = require("cookie-parser");
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { calculateTotalPrice, getPaginatedProducts, generateMockProducts } = require('../services/utils');

router.use(cookieParser());
router.use('/api/sessions', SessionRouter);
router.use('/api/products', ProductRouter);
router.use('/api/carts', CartRouter);

router.get('/', (req, res) => {
  res.redirect('/login'); // Redirige a la página de inicio de sesión
});

router.get('/register', (req, res) => {
  res.render('register'); // Renderizar la vista de registro
});

router.get('/login', (req, res) => {
  res.render('login'); // Renderizar la vista de inicio de sesión
});

router.get('/mockingproducts', async (req, res) => {
  try {
    const mockingProducts = generateMockProducts(50);
    res.json(mockingProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ruta para mostrar la vista de productos con paginación
router.get('/products', authMiddleware, roleMiddleware('user'), async (req, res) => {
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

    const productsResponse = await getPaginatedProducts(filters, sortOptions, parseInt(limit), parseInt(page));

    const prevLink = productsResponse.prevLink
      ? `/products?limit=${limit}&page=${parseInt(page) - 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    const nextLink = productsResponse.nextLink
      ? `/products?limit=${limit}&page=${parseInt(page) + 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    res.render('products', {
      user: req.session.user, // Pasar el usuario autenticado a la vista
      products: productsResponse.products,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  } catch (error) {
    res.status(500).send('Error retrieving products from database.');
  }
});

router.get('/cart/:cid', authMiddleware, roleMiddleware('user'), async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await CartDAO.getCartById(cid);
    const totalPrice = calculateTotalPrice(cart);
    res.render('carts', { cart, totalPrice });
  } catch (error) {
    res.status(404).send('Cart not found.');
  }
});

router.get('/cart/:cid/purchase', authMiddleware, roleMiddleware('user'), async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await CartDAO.getCartById(cid);
    const totalPrice = calculateTotalPrice(cart);
    res.render('carts', { cart, totalPrice });
  } catch (error) {
    res.status(404).send('Cart not found.');
  }
});

router.get('/chat', authMiddleware, roleMiddleware('user'), (req, res) => {
  res.render('chat', {
    user: req.session.user, 
  });
});

router.get('/realtimeproducts', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const products = await ProductDAO.getAllProducts();
    const productsData = products.map((product) => product.toObject());
    const newProduct = {}; // Crear un objeto vacío para newProduct
    res.render('realTimeProducts', { products: productsData, newProduct }); // Agregar newProduct al contexto
  } catch (error) {
    res.status(500).json({ status: 500, response: error.message });
  }
});

router.get('/profile', authMiddleware, (req, res) => {
  const user = req.session.user;
  res.render('profile', { user });
});

router.get('/sms', authMiddleware, async (req, res) => {
  const client = twilio(config.twilioSid, config.twilioToken)
  await client.messages.create({
    body: 'Aquí tienes el codigo de verificación: 757057',
    from: config.twilioNumber,
    to: config.testNumber
  })
  res.send({ status: "success", response: "Se envió correctamente el mensaje." });
})

module.exports = router;