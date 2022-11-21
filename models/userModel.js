const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must provide a name'],
  },
  email: {
    type: String,
    required: [true, 'must provide a email'],
  },
  image: {
    type: String,
    default: 'default-user.png',
  },
  password: {
    type: String,
    required: [true, 'must provide a password'],
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('User', userSchema);
