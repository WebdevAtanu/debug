import mongoose from 'mongoose';
import Joi from 'joi';
import { UserInfoSchema } from './userModel.js';
import ReactionSchema from './ReactionSchema.js';

// Comment Schema
const CommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 1000,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    reactions: {
      type: [ReactionSchema],
      default: [],
    },

    author: {
      type: UserInfoSchema,
      required: true,
    },

    bugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// remove __v and transform _id to id for cleaner API responses
CommentSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

// Indexes for efficient querying of comments by bug and date
CommentSchema.index({ bugId: 1 });
CommentSchema.index({ createdAt: -1 });

// create the model
const Comment = mongoose.model('Comment', CommentSchema, 'comments');

// Validation Function 
const validateComment = (comment) => {
  const schema = Joi.object({
    body: Joi.string().min(6).max(1000).required(),

    bugId: Joi.string().required(), // ObjectId as string

    author: Joi.object({
      name: Joi.string().required(),
      username: Joi.string().required(),
    }).required(),

    reactions: Joi.array().default([]),
  });

  return schema.validate(comment);
};

// export the model and validation function
export { CommentSchema, Comment, validateComment };