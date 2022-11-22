const express = require('express');
const app = express();
const connectDB = require('./db/connect');
require('dotenv').config();
// const notFound = require('./middleware/not-found');
// const errorHandlerMiddleware = require('./middleware/error-handler');

// middleware
app.use(express.json());

// routes
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
app.use('/', userRoute);
app.use('/admin', adminRoute);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`Successfully connected to DB..`);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
