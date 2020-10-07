import Router from 'express';
import { BadRequestError } from '../utils/errors.js';
import auth from '../middleware/auth.js';

const router = Router();

/* List of all posts */
router.get('/', async (req, res) => {
  const posts = await req.context.models.Post.find()
    .populate('post')
    .populate({path: 'comments', select: 'text createdAt', populate: 'author'})
    .populate('user')
  return res.send(posts);
});

router.get('/:postId', async (req, res) => {
  const post = await req.context.models.Post.findById(
    req.params.postId,
  );
  return res.send(post);
});

/* Create new post */
router.post('/', auth,  async (req, res, next) => {
  const post = await req.context.models.Post.create({
    title: req.body.title,
    text: req.body.text,
    user: req.body.user,
  }).catch((error) => next(new BadRequestError(error)));

  return res.send(post);
});

/* Create new comment for selected post */
router.post('/comment', auth,  async (req, res, next) => {
  const comment = await req.context.models.Comment.create({
    text: req.body.text,
    author: req.body.user,
  }).catch((error) => next(new BadRequestError(error)));

  const newCommentId = await req.context.models.Comment.findOne().sort({ createdAt: -1 }).limit(1);

  const post = await req.context.models.Post.updateOne({ 
    _id: req.body.id }, 
    { $push: { 'comments': newCommentId }
  }).catch((error) => next(new BadRequestError(error)));

  const upPost = await req.context.models.Post.findById(
    req.body.id,
  ).populate('comments');

  return res.send(upPost);
});

/* Update selected post */
router.put('/:postId', auth, async (req, res, next) => {
  const post = await req.context.models.Post.findOneAndUpdate({ 
    _id: req.params.postId }, 
    { title: req.body.title, 
      text: req.body.text, 
      user: req.body.user }
  ).catch((error) => next(new BadRequestError(error)));
  
  return res.send(post);
});

/* Delete selected post */
router.delete('/:postId', async (req, res) => {
  const post = await req.context.models.Post.findById(
    req.params.postId,
  );
  if (post) {
    await post.remove();
  }
  return res.send(post);
});

export default router;