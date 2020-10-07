import Router from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = Router();

router.get('/', auth, admin, async (req, res) => {
  const users = await req.context.models.User.find();
  return res.send(users);
});

router.post('/signup', async (req, res, next) => {
  // Register new user
  try {
    const exists = await User.findOne({email: req.body.email});
    if (exists) {
      return res.status(401).send({error: 'User allready exists'})
    }
    const user = new User(req.body)
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/login', async(req, res) => {
  // Login registered user
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res.status(401).send({error: 'Login failed! Check authentication credentials'})
    }
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
});

router.get('/me', auth, async(req, res) => {
  // View logged in user profile
  res.send(req.user)
});

router.post('/me/logout', auth, async (req, res) => {
  // Log user out of the application
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/me/logoutall', auth, async(req, res) => {
  // Log user out of all devices
  try {
      req.user.tokens.splice(0, req.user.tokens.length)
      await req.user.save()
      res.send()
  } catch (error) {
      res.status(500).send(error)
  }
})

router.get('/:userId', auth, async (req, res) => {
  const user = await req.context.models.User.findById(
    req.params.userId,
  );
  return res.send(user);
});

/* Update selected user */
router.put('/:userId', async (req, res) => {
    try {
      const existsEmail = await User.findOne({_id: { $ne: req.params.userId }, email: req.body.email});
      if (existsEmail) {
        return res.status(401).send({error: 'Email allready exists'})
      }
      const existsUsername = await User.findOne({_id: { $ne: req.params.userId }, username: req.body.username});
      if (existsUsername) {
        return res.status(401).send({error: 'Username allready exists'})
      } 
      const user = await req.context.models.User.findByIdAndUpdate(
        req.params.userId, 
        { username: req.body.username,
          email: req.body.email,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          password: req.body.password }, 
        function (err, docs) { 
          if (err){ 
            res.status(500).send(err)
          } 
          else{ 
            //console.log("Updated User : ", docs); 
            return res.send(docs);
          } 
      });
    } catch(error) {
      res.status(500).send(error)
    }
  }
); 

export default router;