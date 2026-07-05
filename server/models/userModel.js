import mongoose from 'mongoose';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

// User Info Subschema
const UserInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      lowercase: true,
    },
  },
  { _id: false }
);

UserInfoSchema.set('toJSON', {
  versionKey: false, // remove __v
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
      lowercase: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 6,
      maxlength: 100,
      required: function () {
        return this.provider === 'local'; // only required for local users
      },
    },

    provider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local',
    },

    googleId: {
      type: String,
    },

    bio: {
      type: String,
      minlength: 6,
      maxlength: 200,
      default: '404 Bio Not Found',
    },

    avatar: {
      type: mongoose.Schema.Types.ObjectId
    },

    avatarUrl: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // optional useful fields
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Transform output when converting to JSON
UserSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  try {
    // skip if not local auth
    if (this.provider !== 'local') return next();

    // hash only if password modified
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password for login
UserSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Expiration Index (for unverified users) - automatically deletes unverified users after a certain time
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * parseInt(process.env.EXPIRATION_TIME || 60),
    partialFilterExpression: { isVerified: false },
  }
);

// Indexes for efficient querying by email and username (especially important for login and user lookup)
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// create the model
const User = mongoose.model('User', UserSchema);

// Validation for User Registration
const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(6).max(100).required(),

    username: Joi.string().min(2).max(100).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).max(100).when('provider', {
      is: 'local',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    provider: Joi.string().valid('google', 'local').default('local'),

    confirmPassword: Joi.any().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match',
    }),

    avatarUrl: Joi.string().uri().optional(),
  });

  return schema.validate(user);
};

// Validation for User Login
const validateUserLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
  });

  return schema.validate(user);
};

// export the model and validation functions
export {
  User,
  UserSchema,
  UserInfoSchema,
  validateUser,
  validateUserLogin,
};