import 'dotenv/config.js';
import cors from 'cors';
import express from 'express';
//import models from './models';
import models, { connectDb } from './models/index.js';
import routes from './routes/index.js';
//require('dotenv').config();
//import passport from 'passport';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(async (req, res, next) => {
  req.context = {
    models,
    //me: await models.User.findByLogin('rwieruch'),
  };
  next();
});

//app.use('/session', routes.session);
app.use('/users', routes.user);
app.use('/posts', routes.post);
//app.use('/comments', routes.comment);

app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;

  if (error.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(error.statusCode)
    .json({ error: error.toString() });
});

app.get('*', function (req, res, next) {
  const error = new Error(
    `${req.ip} tried to access ${req.originalUrl}`,
  );

  error.statusCode = 301;

  next(error);
});

//const auth = require('./routes/auth.js');
//app.use('/auth', auth);

connectDb().then(async () => {
  app.listen(process.env.PORT, () =>
    console.log(`Blog app listening on port ${process.env.PORT}!`),
  );
});