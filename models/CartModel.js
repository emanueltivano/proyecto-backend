const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      units: {
        type: Number,
        required: true,
      },
    },
  ]
}, {
  versionKey: false
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;