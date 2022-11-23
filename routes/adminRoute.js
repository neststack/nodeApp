const express = require('express');
const route = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { isLogin, isLogout } = require('../middleware/adminAuth');

// middleware
route.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
route.use(express.static('public'));
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

// view engine
route.set('view engine', 'ejs');
route.set('views', './views/admin');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/userImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

const {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUsers,
} = require('../controllers/adminController');

route.get('/', isLogout, loadLogin);
route.post('/', verifyLogin);
route.get('/home', isLogin, loadDashboard);
route.get('/logout', isLogin, logout);
route.get('/forget', isLogout, forgetLoad);
route.post('/forget', forgetVerify);
route.get('/forget-password', isLogout, forgetPasswordLoad);
route.post('/forget-password', resetPassword);
route.get('/dashboard', isLogin, adminDashboard);
route.get('/new-user', isLogin, newUserLoad);
route.post('/new-user', upload.single('image'), addUser);
route.get('/edit-user', isLogin, editUserLoad);
route.post('/edit-user', updateUsers);
route.get('*', (req, res) => {
  res.redirect('/admin');
});

module.exports = route;
