const express = require('express');
const app = express();
const connectDB = require('./db/connect');
require('dotenv').config();
const userRoute = require('./routes/userRoute');
// const notFound = require('./middleware/not-found');
// const errorHandlerMiddleware = require('./middleware/error-handler');

// middleware
app.use(express.static('./public'));
app.use(express.json());

// routes
app.use('/', userRoute);
// app.get('/api/v1/tasks')         - get all the tasks
// app.post('/api/v1/tasks')        - create new task
// app.get('/api/v1/tasks/:id')     - get single task
// app.patch('/api/v1/tasks/:id')   - update task
// app.delete('/api/v1/tasks/:id')  - delete task
// app.use(notFound);
// app.use(errorHandlerMiddleware);

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
