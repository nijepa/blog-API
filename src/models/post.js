import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment'} ]
  },
  { timestamps: true },
);

/* If post deleted remove all comments on post */
postSchema.pre('remove', function(next) {
  this.model('Comment').deleteMany({ comments: this._id }, next);
});

const Post = mongoose.model('Post', postSchema);

export default Post;