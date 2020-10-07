import mongoose from 'mongoose';

import User from './user.js';
import Post from './post.js';
import Comment from './comment.js';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });;
};

const models = { User, Post, Comment };

export { connectDb };

export default models;