const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

const loadLogin = async (req, res) => {
  try {
    res.render('login');
  } catch (err) {
    console.log('loadLogin', err.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render('login', { message: 'Email and password is incorrect' });
        } else {
          req.session.user_id = userData._id;
          res.redirect('/admin/home');
        }
      } else {
        res.render('login', { message: 'Email and password is incorrect' });
      }
    } else {
      res.render('login', { message: 'Email and password is incorrect' });
    }
  } catch (err) {
    console.log('verifyLogin', err.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    res.render('home');
  } catch (err) {
    console.log('loadDashboard', err.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/admin');
  } catch (err) {
    console.log('logout', err.message);
  }
};

const forgetLoad = async (req, res) => {
  try {
    res.render('forget');
  } catch (err) {
    console.log('forgetLoad', err.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_admin === 0) {
        res.render('forget', { message: 'Email is incorrect' });
      } else {
      }
    } else {
      res.render('forget', { message: 'Email is incorrect' });
    }
  } catch (err) {
    console.log('forgetVerify', err.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
};
