const express = require('express');
const route = express();
const session = require('express-session');
route.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

const { isLogin, isLogout } = require('../middleware/auth');

const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
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

// middleware
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

// view engine
route.set('view engine', 'ejs');
route.set('views', './views/users');

const {
  loadRegister,
  addUser,
  verifyMail,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  verificationLoad,
  sendVerificationLink,
} = require('../controllers/userController');

route
  .get('/register', isLogout, loadRegister)
  .get('/verify', verifyMail)
  .get('/', isLogout, loginLoad)
  .get('/login', isLogout, loginLoad)
  .get('/home', isLogin, loadHome)
  .get('/logout', isLogin, userLogout)
  .get('/forget', isLogout, forgetLoad)
  .get('/forget-password', isLogout, forgetPasswordLoad)
  .get('/verification', verificationLoad)
  .post('/verification', sendVerificationLink)
  .post('/forget-password', resetPassword)
  .post('/forget', forgetVerify)
  .post('/login', verifyLogin)
  .post('/register', upload.single('image'), addUser);

module.exports = route;
