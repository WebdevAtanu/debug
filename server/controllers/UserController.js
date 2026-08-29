import Joi from 'joi';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  User,
  validateUser,
  validateUserLogin,
} from '../models/userModel.js';
import { Bug } from '../models/bugModel.js';
import { Token } from '../models/tokenModel.js';
import { extractUsernameFromEmail } from '../utils/index.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import db from '../config/database.js';


export const signup = async (req, res) => {
  const { error, value } = validateUser(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const foundUser = await User.findByEmail(value.email);
    if (foundUser)
      return res.conflict({ error: 'Username / Email Already Exists' });

    // save the user data into database
    const usernameFromEmail = extractUsernameFromEmail(value.email);
    const avatarUrl = `http://${req.headers.host}/api/user/${usernameFromEmail}/avatar/raw`;
    
    const savedUser = await User.create({
      name: value.name,
      provider: value.provider,
      username: usernameFromEmail,
      email: value.email,
      password: value.password,
      avatarUrl,
    });

    // create email verification token
    const tokenString = crypto.randomBytes(16).toString('hex');
    const savedToken = await Token.create({
      token: tokenString,
      user_id: savedUser.id,
    });

    if (!savedToken)
      return res.internalError({
        error: "Something wen't wrong while verifying email",
      });
    // create verification link and send email
    const verificationLink = `http://${req.headers.host}/api/user/verify-email?token=${tokenString}`;
    await sendVerificationEmail(savedUser.email, tokenString);

    res.created({
      data: {
        isVerified: savedUser.isVerified,
        avatarUrl: savedUser.avatarUrl,
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        name: savedUser.name,
        bio: savedUser.bio,
        provider: savedUser.provider,
      },
    });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const login = async (req, res) => {
  const { error, value } = validateUserLogin(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    // check if user exist
    const user = await User.findByEmail(value.email);
    if (!user) return res.notFound({ error: 'Email does not exists' });

    // make sure user is verified
    if (!user.isVerified) return res.forbidden({ error: 'Email not verified' });

    // user only signed up with google
    const provider = JSON.parse(user.provider || '[]');
    if (!user.password || !provider.includes('local')) {
      return res.notFound({
        error: 'Unknown auth method, Try logging in with Google',
      });
    }

    // Check/Compares password
    const validPassword = await User.comparePassword(value.password, user.password);
    if (!validPassword)
      return res.forbidden({ error: 'Password is incorrect' });

    // Create JWT Token
    const token = jwt.sign(
      {
        sub: user.id,
        isVerified: user.isVerified,
        username: user.username,
        provider: provider,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        id: user.id,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '2h' }
    );

    res
      .status(200)
      .cookie('jwt', token, { maxAge: 2 * 3600000, httpOnly: true })
      .send({
        data: {
          isVerified: user.isVerified,
          username: user.username,
          provider: provider,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          id: user.id,
          bio: user.bio,
        },
      });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const logout = (req, res) => {
  req.logout();
  // res.send(req.user)
  res.status(200).clearCookie('jwt').send({ message: 'logged out' });
};

export const updateBio = async (req, res) => {
  const { error, value } = Joi.object({
    bio: Joi.string().max(100).required(),
  }).validate(req.body);

  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const user = await User.updateById(req.user.id, { bio: value.bio });

    if (!user) return res.notFound({ error: 'User not found' });

    res.ok({ data: user.bio });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while updating bio',
    });
  }
};

export const checkAuth = (req, res) => {
  res.ok({ data: req.user });
};

export const verifyEmail = async (req, res) => {
  try {
    // find token
    const token = await Token.findByToken(req.query.token);
    if (!token)
      return res.notFound({ error: 'Unable to find verification token' });

    // find user with matching token
    const user = await User.findById(token.user_id);
    if (!user)
      return res.notFound({
        error: 'Unable to find matching user & token for verification',
      });
    if (user.isVerified)
      return res.badRequest({ error: 'User is already verified' });

    // everything looks good! save user
    const savedUser = await User.updateById(user.id, { isVerified: true });
    if (!savedUser)
      return res.internalError({ error: 'Error while verifying user' });

    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while verifying email address',
    });
  }
};

export const getByUsername = async (req, res) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user)
      return res.notFound({
        error: `User not found with the username ${req.params.username}`,
      });

    res.ok({ data: user });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getMultipleByIds = async (req, res) => {
  const { error, value } = Joi.object({
    user_ids: Joi.array().items(Joi.number()).required(),
  }).validate(req.body);

  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const users = await db('users')
      .whereIn('id', value.user_ids)
      .select('id', 'username');
    if (!users || users.length === 0) return res.notFound({ error: 'Users not found' });

    res.ok({ data: users });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getAllUsers = async (req, res) => {
  const MAX_ITEMS = 10;
  const page = parseInt(req.query.page) - 1 || 0;
  try {
    const users = await db('users')
      .select('id', 'username', 'name', 'avatarUrl', 'bio')
      .orderBy('created_at', 'desc');

    if (!users || users.length === 0) return res.notFound({ error: 'No users found!' });

    res.ok({
      totalDocs: users.length,
      totalPages: Math.ceil(users.length / MAX_ITEMS),
      data: users.slice(MAX_ITEMS * page, MAX_ITEMS * page + MAX_ITEMS),
    });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while getting users',
    });
  }
};

export const getCurrent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.notFound({ error: 'User Not Found!' });

    const provider = JSON.parse(user.provider || '[]');
    res.ok({ 
      data: {
        ...user,
        provider,
      }
    });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getCommentsByUser = async (req, res) => {
  try {
    const comments = await db('comments')
      .join('users as author', 'comments.author_id', 'author.id')
      .join('bugs', 'comments.bug_id', 'bugs.id')
      .select(
        'comments.content as body',
        'comments.created_at as date',
        'author.id as author_id',
        'author.username as author_username',
        'author.name as author_name',
        'bugs.id as bug_id'
      )
      .where('author.username', req.params.username)
      .orderBy('comments.created_at', 'desc');

    const result = comments.map(comment => ({
      body: comment.body,
      date: comment.date,
      author: {
        id: comment.author_id,
        username: comment.author_username,
        name: comment.author_name,
      },
      id: comment.bug_id,
    }));

    if (!result || result.length === 0) return res.notFound({ error: 'Comments Not Found!' });
    res.ok({ data: result });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getCommentsCountByUser = async (req, res) => {
  try {
    const result = await db('comments')
      .join('users as author', 'comments.author_id', 'author.id')
      .where('author.username', req.params.username)
      .count('* as count')
      .first();

    if (!result) return res.notFound({ error: 'Not Found!' });
    res.ok({ data: { count: result.count } });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getCollectedReactionsCount = async (req, res) => {
  try {
    const comments = await db('comments')
      .join('users as author', 'comments.author_id', 'author.id')
      .where('author.username', req.params.username)
      .select('comments.reactions');

    const reactions = {};
    comments.forEach(comment => {
      const commentReactions = JSON.parse(comment.reactions || '{}');
      Object.keys(commentReactions).forEach(emoji => {
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        reactions[emoji].push(...commentReactions[emoji]);
      });
    });

    const result = Object.keys(reactions).map(emoji => ({
      emoji,
      users: reactions[emoji].map(r => r[0] || r),
    }));

    if (!result || result.length === 0) return res.notFound({ error: 'Not Found!' });
    res.ok({ data: result });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

export const getBugsByUser = async (req, res) => {
  try {
    const bugs = await Bug.findAll({ author_username: req.params.username });
    if (!bugs || bugs.length === 0) return res.notFound({ error: 'Bug Not Found!' });

    res.ok({ data: bugs });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};
