const express = require('express');
const route = express();
const session = require('express-session');

const { isLogin, isLogout } = require('../middleware/auth');

const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

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
route.set('views', './views/users');

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
  editLoad,
  updateProfile,
} = require('../controllers/userController');

route.get('/register', isLogout, loadRegister);
route.post('/register', upload.single('image'), addUser);
route.get('/verify', verifyMail);
route.get('/', isLogout, loginLoad);
route.get('/login', isLogout, loginLoad);
route.post('/login', verifyLogin);
route.get('/home', isLogin, loadHome);
route.get('/logout', isLogin, userLogout);
route.get('/forget', isLogout, forgetLoad);
route.post('/forget', forgetVerify);
route.get('/forget-password', isLogout, forgetPasswordLoad);
route.post('/forget-password', resetPassword);
route.get('/verification', verificationLoad);
route.post('/verification', sendVerificationLink);
route.get('/edit', isLogin, editLoad);
route.post('/edit', upload.single('image'), updateProfile);

module.exports = route;
