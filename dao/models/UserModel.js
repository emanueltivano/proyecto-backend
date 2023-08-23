const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    age: Number,
    password: String,
    role: {
      type: String,
      enum: ['usuario', 'administrador'],
      default: 'usuario'
    },
    admin: {
      type: Boolean,
      default: false
    }
}, {
    versionKey: false
});

module.exports = model('users', userSchema);