const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log('securePassword', err.message);
  }
};

// send verification mail
const sendVerifyMail = async (name, email, user_id) => {
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
      subject: 'For verification mail',
      html:
        '<p>Hi <span style="font-weight:800;">' +
        name +
        '</span>, please click here to <a href="http://localhost:5000/verify?id=' +
        user_id +
        '"> Verify </a> your mail.</p>',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent:- ', info.response);
      }
    });
  } catch (err) {
    console.log('sendVerifyMail', err.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('registration');
  } catch (err) {
    console.log('loadRegister', err.message);
  }
};

const addUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: req.file.filename,
      password: spassword,
      is_admin: 0,
    });
    const userData = await user.save();
    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.render('registration', {
        message: 'Registration successful. Please verify your e-mail!',
      });
    } else {
      res.render('registration', { message: 'Registration failed!' });
    }
  } catch (err) {
    res.render('registration', { message: err.message });
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    res.render('email-verified');
  } catch (err) {
    console.log('verifyMail', err.message);
  }
};

// login user methods
const loginLoad = async (req, res) => {
  try {
    res.render('login');
  } catch (err) {
    console.log('loginLoad', err.message);
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
        if (userData.is_verified === 0) {
          res.render('login', { message: 'Please verify your mail.' });
        } else {
          // console.log('verifyLogin', userData);
          req.session.user_id = userData._id;
          res.redirect('/home');
        }
      } else {
        res.render('login', { message: 'Email or password incorrect' });
      }
    } else {
      res.render('login', { message: 'Email or password incorrect' });
    }
  } catch (err) {
    console.log('verifyLogin', err.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render('home', { user: userData });
  } catch (err) {
    console.log('loadHome', err.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (err) {
    console.log('userLogout', err.message);
  }
};

// forget password
const forgetLoad = async (req, res) => {
  try {
    res.render('forget');
  } catch (err) {
    console.log('forgetLoad', err.message);
  }
};

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
        '</span>, please click here to <a href="http://localhost:5000/forget-password?token=' +
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

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 0) {
        res.render('forget', { message: 'Please verify your mail.' });
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
      res.render('forget', { message: 'User email is incorrect' });
    }
  } catch (err) {
    console.log('forgetVerify', err.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render('forget-password', { user_id: tokenData._id });
    } else {
      res.render('404', { message: 'Token is invalid' });
    }
  } catch (err) {
    console.log('forgetPasswordLoad', err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token: '' } }
    );
    res.redirect('/');
  } catch (error) {
    console.log('resetPassword', err.message);
  }
};

// verification send mail link
const verificationLoad = async (req, res) => {
  try {
    res.render('verification-form');
  } catch (error) {
    console.log('verificationLoad', err.message);
  }
};

const sendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      sendVerifyMail(userData.name, userData.email, userData._id);
      res.render('verification-form', {
        message: 'Resent verification mail at your email id, please check.',
      });
    } else {
      res.render('verification-form', {
        message: 'This email does not exist.',
      });
    }
  } catch (error) {
    console.log('sendVerificationLink', err.message);
  }
};

// user profile edit & update
const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render('edit', { user: userData });
    } else {
      res.redirect('/home');
    }
  } catch (err) {
    console.log('editLoad', err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        { $set: { name: req.body.name, email: req.body.email } }
      );
    }
    res.redirect('/home');
  } catch (err) {
    console.log('updateProfile', err.message);
  }
};

module.exports = {
  addUser,
  loadRegister,
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
};
