const express = require('express');
const route = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const { isLogin, isLogout } = require('../middleware/adminAuth');

// middleware
route.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

// view engine
route.set('view engine', 'ejs');
route.set('views', './views/admin');

const {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
} = require('../controllers/adminController');

route.get('/', isLogout, loadLogin);
route.post('/', verifyLogin);
route.get('/home', isLogin, loadDashboard);
route.get('/logout', isLogin, logout);
route.get('/forget', isLogout, forgetLoad);
route.post('/forget', forgetVerify);
route.get('*', (req, res) => {
  res.redirect('/admin');
});

module.exports = route;
