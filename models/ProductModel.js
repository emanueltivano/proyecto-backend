const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number },
  status: { type: Boolean, default: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] },
}, {
  versionKey: false,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;