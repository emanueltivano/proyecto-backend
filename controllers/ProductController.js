const ProductRepository = require('../repositories/ProductRepository');
const { countProducts, getProducts } = require('../services/utils');
const Errors = require('../services/errors/Errors');
const CustomError = require('../services/errors/CustomError');
const GenerateProductError = require('../services/errors/info');
const { transport } = require('../services/utils');

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

    // Obtener el correo electrónico del usuario autenticado
    const owner = req.session.user.email;

    // Verificar si los datos del producto son válidos
    if (!newProductData.title || !newProductData.description || !newProductData.code || !newProductData.price || !newProductData.stock || !newProductData.category) {
      const errorMessage = GenerateProductError(newProductData);
      const error = CustomError({
        name: 'ProductCreationError',
        cause: errorMessage,
        message: 'Error trying to create Product',
        code: Errors.INVALID_TYPES_ERROR
      });
      return res.status(400).json({ status: 400, error: error.message });
    }

    // Agregar el campo "owner" al objeto de datos del producto
    newProductData.owner = owner || "admin";

    try {
      // Crear el producto con el campo "owner"
      const newProduct = await ProductRepository.createProduct(newProductData);
      res.status(201).json({ status: 201, response: newProduct });
    } catch (error) {
      // Manejar errores al crear el producto
      res.status(500).json({ status: 500, error: 'Error trying to create Product' });
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
    const user = req.session.user; // Obtener el usuario autenticado desde la sesión

    try {
      const product = await ProductRepository.getProductById(pid);

      // Verificar si el producto existe
      if (!product) {
        return res.status(404).json({ status: 404, response: 'Product not found.' });
      }

      // Verificar si el usuario es un usuario premium y si el producto le pertenece
      if (user.role === 'premium' && product.owner === user.email) {

        const deletedProduct = await ProductRepository.deleteProduct(pid);

        // Envía un correo electrónico al usuario premium informándole que su producto fue eliminado
        await transport.sendMail({
          from: 'Ecommerce <correoenvios@example.com>',
          to: email,
          subject: "Eliminación de producto",
          html: `
          <div>
            <h1>¡Tu producto "${product.name}" ha sido eliminado. Si tienes alguna pregunta, por favor contáctanos.</h1>
          </div>
          `,
          attachments: []
        });

        return res.json({ status: 200, response: deletedProduct });
      } else if (user.role === 'admin') {
        // Si el usuario es un administrador, permitir la eliminación del producto sin importar el owner
        await transport.sendMail({
          from: 'Ecommerce <correoenvios@example.com>',
          to: product.owner,
          subject: "Eliminación de producto",
          html: `
          <div>
            <h1>¡Tu producto "${product.name}" ha sido eliminado. Si tienes alguna pregunta, por favor contáctanos.</h1>
          </div>
          `,
          attachments: []
        });
        const deletedProduct = await ProductRepository.deleteProduct(pid);
        res.json({ status: 200, response: deletedProduct });
      } else {
        // Si el usuario no tiene permisos, enviar una respuesta de error
        res.status(403).json({ status: 403, response: 'Unauthorized: You do not have permission to delete this product.' });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, response: error.message });
    }
  }
}

module.exports = new ProductController();