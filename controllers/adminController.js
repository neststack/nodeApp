const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

// reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'For reset password',
      html:
        '<p>Hi <span style="font-weight:800;">' +
        name +
        '</span>, please click here to <a href="http://localhost:5000/admin/forget-password?token=' +
        token +
        '"> Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent:- ', info.response);
      }
    });
  } catch (err) {
    console.log('sendResetPasswordMail', err.message);
  }
};

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
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render('forget', {
          message: 'Please check your mail to reset your password.',
        });
      }
    } else {
      res.render('forget', { message: 'Email is incorrect' });
    }
  } catch (err) {
    console.log('forgetVerify', err.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = User.findOne({ token: token });
    if (tokenData) {
      res.render('forget-password', { user_id: tokenData._id });
    } else {
      res.render('404', { message: 'Invalid Link' });
    }
  } catch (err) {
    console.log('forgetPasswordLoad', err.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
};
