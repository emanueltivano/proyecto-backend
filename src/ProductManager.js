const fs = require('fs');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  addProduct(product) {
    const products = this.getProducts();
    product.id = products.length + 1;
    products.push(product);
    this.saveProducts(products);
    return product.id;
  }

  getProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(product => product.id === id);
  }

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex !== -1) {
      const updatedProduct = { ...products[productIndex], ...updatedFields };
      products[productIndex] = updatedProduct;
      this.saveProducts(products);
      return updatedProduct;
    }
    return null;
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex !== -1) {
      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      this.saveProducts(products);
      return deletedProduct;
    }
    return null;
  }

  saveProducts(products) {
    const data = JSON.stringify(products, null, 2);
    fs.writeFileSync(this.path, data);
  }
}

module.exports = ProductManager;