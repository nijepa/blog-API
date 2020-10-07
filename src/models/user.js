import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: value => {
        if (!validator.isEmail(value)) {
          throw new Error({error: 'Invalid Email address'})
        }
      }
    },
    password: {
      type: String,
      required: true,
      minLength: 7
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }],
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }}
);

userSchema.set('toObject', { virtuals: true })
userSchema.set('toJSON', { virtuals: true })

userSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
});

userSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign({_id: user._id}, process.env.JWT_KEY);
  user.tokens = user.tokens.concat({token});
  await user.save()
  return token
};

userSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  function myError(error) {
    this.error = error
  }

  myError.prototype = new Error()
  const user = await User.findOne({ email})
  if (!user) {
    //throw new myError({ error: 'Invalid login email credentials' })
    throw new myError('Invalid login email credentials');
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new myError('Invalid login password credentials');
  }
  return user
};

userSchema.statics.findByLogin = async function (login) {
  let user = await this.findOne({
    username: login,
  });
  if (!user) {
    user = await this.findOne({ email: login });
  }
  return user;
};

userSchema
  .virtual('name')
  .get(function () {
    let fullname = '';
    if (this.first_name && this.last_name) {
      fullname = this.last_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.last_name) {
      fullname = '';
    }
    return fullname;
});

/* If user deleted remove all user posts and comments */
userSchema.pre('remove', function(next) {
  this.model('Post').deleteMany({ user: this._id }, next);
  this.model('Comment').deleteMany({ user: this._id }, next);
});

const User = mongoose.model('User', userSchema);

export default User;