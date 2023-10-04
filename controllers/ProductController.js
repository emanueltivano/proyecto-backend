const ProductRepository = require('../repositories/ProductRepository');
const { countProducts, calculateTotalPages, getProducts } = require('../services/utils');

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
    try {
      const newProduct = await ProductRepository.createProduct(newProductData);
      res.status(201).json({ status: 201, response: newProduct });
    } catch (error) {
      res.status(400).json({ status: 400, response: error.message });
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