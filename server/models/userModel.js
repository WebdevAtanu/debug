import Joi from 'joi';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

class User {
  static async findById(id) {
    const user = await db('users').where({ id }).first();
    if (user) {
      delete user.password;
    }
    return user;
  }

  static async findByEmail(email) {
    return await db('users').where({ email: email.toLowerCase() }).first();
  }

  static async findByUsername(username) {
    return await db('users').where({ username: username.toLowerCase() }).first();
  }

  static async findByGoogleId(googleId) {
    const user = await db('users').where({ googleId }).first();
    if (user) {
      delete user.password;
    }
    return user;
  }

  static async create(userData) {
    const { name, username, email, password, provider = ['local'], googleId, avatar, avatarUrl, bio } = userData;
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const [user] = await db('users').insert({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: JSON.stringify(provider),
      googleId,
      avatar,
      avatarUrl,
      bio: bio || '404 Bio Not Found',
      isVerified: false,
    }).returning('*');
    
    delete user.password;
    return user;
  }

  static async updateById(id, updates) {
    const user = await db('users').where({ id }).update(updates).returning('*');
    if (user && user[0]) {
      delete user[0].password;
    }
    return user[0];
  }

  static async deleteById(id) {
    return await db('users').where({ id }).del();
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

// Validation for User Registration
const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(6).max(100).required(),
    username: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).when('provider', {
      is: 'local',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    provider: Joi.array().items(Joi.string().valid('google', 'local')).default(['local']),
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

export {
  User,
  validateUser,
  validateUserLogin,
};