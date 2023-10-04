const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    age: Number,
    password: String,
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    },
    role: {
        type: String,
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }
}, {
    versionKey: false
});

module.exports = model('User', userSchema);