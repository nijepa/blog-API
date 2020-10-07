import Router from 'express';
import { BadRequestError } from '../utils/errors.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const comments = await req.context.models.Comment.find();
  return res.send(comments);
});

/* router.post('/me', auth, async (req, res, next) => {
  console.log(req.context);
  const comment = await req.context.models.Comment.create({
    text: req.body.text,
    user: req.user._id,
    post: req.post._id,
    //user: req.context.me.id,
  }).catch((error) => next(new BadRequestError(error)));

  return res.send(comment);
}); */

router.post('/:postId', auth, async (req, res, next) => {
  const comment = await req.context.models.Post.findById(
    req.params.postId,
  );

  return res.send(comment);
});

router.get('/:commentId', async (req, res) => {
  const comment = await req.context.models.Comment.findById(
    req.params.commentId,
  );
  return res.send(comment);
});

router.delete('/:commentId', async (req, res) => {
  const comment = await req.context.models.Comment.findById(
    req.params.commentId,
  );

  if (comment) {
    await comment.remove();
  }

  return res.send(comment);
});

export default router;