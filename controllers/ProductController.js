const ProductRepository = require('../repositories/ProductRepository');
const { countProducts, getProducts } = require('../services/utils');
const Errors = require('../services/errors/Errors');
const CustomError = require('../services/errors/CustomError');
const GenerateProductError = require('../services/errors/info');

class ProductController {
  async getAllProducts(req, res) {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filters = {};
    if (query) {
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
      const totalCount = await countProducts(filters);
      const totalPages = Math.ceil(totalCount / limit)

      const skip = (page - 1) * limit;
      const products = getProducts(filters, sortOptions, limit, skip);

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
  }

  async getProductById(req, res) {
    const { pid } = req.params;
    try {
      const product = await ProductRepository.getProductById(pid);
      res.json({ status: 200, response: product });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }

  async createProduct(req, res) {
    const newProductData = req.body;
    const title = newProductData.title;
    const price = newProductData.price;
  
    if (!title || !price || title.trim() === '' || isNaN(price)) {
      const errorMessage = GenerateProductError(newProductData);
      const error = CustomError({
        name: 'ProductCreationError',
        cause: errorMessage,
        message: 'Error trying to create Product',
        code: Errors.INVALID_TYPES_ERROR
      });
      throw error;
    } else {
      const newProduct = await ProductRepository.createProduct(newProductData);
      res.status(201).json({ status: 201, response: newProduct });
    }
  }

  async updateProduct(req, res) {
    const { pid } = req.params;
    const updatedProductData = req.body;
    try {
      const updatedProduct = await ProductRepository.updateProduct(pid, updatedProductData);
      res.json({ status: 200, response: updatedProduct });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
    }
  }

  async deleteProduct(req, res) {
    const { pid } = req.params;
    try {
      const deletedProduct = await ProductRepository.deleteProduct(pid);
      res.json({ status: 200, response: deletedProduct });
    } catch (error) {
      res.status(404).json({ status: 404, response: error.message });
    }
  }
}

module.exports = new ProductController();