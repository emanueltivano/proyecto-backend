const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  code: { type: String },
  price: { type: Number },
  status: { type: Boolean, default: true },
  stock: { type: Number },
  category: { type: String },
  thumbnails: { type: [String], default: [] },
}, {
  versionKey: false,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;