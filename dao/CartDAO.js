const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const Ticket = require('../models/TicketModel');
const ProductDAO = require('../DAO/ProductDAO');
const { generateUniqueCode } = require('../services/utils');

class CartDAO {
  async getCartById(cid) {
    try {
      const cart = await Cart.findById(cid).populate('products.product');
      if (!cart) {
        throw new Error(`Cart with id ${cid} not found.`);
      }

      return cart.toObject();
    } catch (error) {
      throw new Error(`Error fetching cart: ${error.message}`);
    }
  }

  async createCart() {
    try {
      const newCart = new Cart();
      await newCart.save();
      return newCart;
    } catch (error) {
      throw new Error('Error creating cart.');
    }
  }

  async addProductToCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      const product = await Product.findById(pid);

      if (!cart || !product) {
        throw new Error('Cart or product not found.');
      }

      // Verifica si hay suficiente stock antes de agregar el producto al carrito
      if (product.stock > 0) {
        const existingProduct = cart.products.find((p) => p.product && p.product.toString() === pid);
        if (existingProduct) {
          existingProduct.units += 1;
        } else {
          const newProduct = { product: pid, units: 1 };
          cart.products.push(newProduct);
        }

        // Primero guarda el carrito para asegurar que el producto se agregue al carrito
        await cart.save();

        // Luego, actualiza el stock del producto después de agregarlo al carrito
        product.stock -= 1;
        await product.save();

        return cart;
      } else {
        throw new Error('Product out of stock.');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeProductFromCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      const product = await Product.findById(pid);

      if (!cart || !product) {
        throw new Error('Cart or product not found.');
      }

      const existingProduct = cart.products.find((p) => p.product && p.product.toString() === pid);
      if (existingProduct) {
        existingProduct.units -= 1;

        // Aumenta el stock del producto después de quitarlo del carrito
        product.stock += 1;
        await product.save();

        if (existingProduct.units <= 0) {
          cart.products = cart.products.filter((p) => p.product && p.product.toString() !== pid);
        }

        await cart.save();
        return cart;
      } else {
        throw new Error('Product not found in the cart.');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateCart(cid, newProducts) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(`Cart with id ${cid} not found.`);
      }

      cart.products = newProducts;

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateProductUnits(cid, pid, units) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(`Cart with id ${cid} not found.`);
      }

      const existingProduct = cart.products.find((p) => p.product && p.product.toString() === pid);
      if (existingProduct) {
        existingProduct.units = units;
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeAllProductsFromCart(cid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(`Cart with id ${cid} not found.`);
      }
  
      // Guarda temporalmente los productos que se eliminarán del carrito
      const productsToRemove = cart.products;
  
      // Elimina todos los productos del carrito
      cart.products = [];
      await cart.save();
  
      // Aumenta el stock de los productos eliminados del carrito
      for (const product of productsToRemove) {
        const existingProduct = await Product.findById(product.product);
        if (existingProduct) {
          existingProduct.stock += product.units;
          await existingProduct.save();
        }
      }
  
      return cart;
    } catch (error) {
      throw new Error(error.message);
    }
  }  

  async finishPurchase(cid, req) {
    try {
      const cart = await Cart.findById(cid);
      const productsToPurchase = cart.products;

      const productsNotPurchased = [];

      for (const product of productsToPurchase) {
        const { product: productId, units: quantity } = product;

        const existingProduct = await ProductDAO.getProductById(productId);

        if (existingProduct && existingProduct.stock >= quantity) {
          // Agrega el producto al ticket
          const totalAmount = quantity * existingProduct.price;

          const ticket = new Ticket({
            code: generateUniqueCode(),
            amount: totalAmount,
            purchaser: req.session.user.email,
          });

          await ticket.save();
        } else {
          // Si no hay suficiente stock, agrega el productId a la lista de productos no comprados
          productsNotPurchased.push(productId);
        }
      }

      // Actualiza el carrito con los productos que no se pudieron comprar
      cart.products = productsNotPurchased.map((productId) => ({ product: productId, units: 1 }));
      await cart.save();

      return { success: true, productsNotPurchased };
    } catch (error) {
      console.error(error);
      throw new Error('Error al procesar la compra');
    }
  }
}

module.exports = new CartDAO();