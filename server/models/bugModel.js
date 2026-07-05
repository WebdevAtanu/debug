import mongoose from 'mongoose';
import Joi from 'joi';
import autoIncrement from 'mongoose-sequence';

import { UserInfoSchema } from './userModel.js';
import { CommentSchema } from './commentModel.js';
import ReactionSchema from './ReactionSchema.js';

const AutoIncrement = autoIncrement(mongoose);

// Activities Schema
const ActivitiesSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['closed', 'opened'],
      required: true,
    },

    author: {
      type: UserInfoSchema,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // disable _id for subdocument 
);

const VALID_LABELS = ['bug', 'feature', 'help wanted', 'enhancement']; // labels for validation and filtering

// Bug Schema
const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 100,
    },

    body: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    dateOpened: {
      type: Date,
      default: Date.now,
    },

    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },

    activities: {
      type: [ActivitiesSchema],
      default: [],
    },

    author: {
      type: UserInfoSchema,
      required: true,
    },

    labels: {
      type: [
        {
          type: String,
          enum: VALID_LABELS,
        },
      ],
      default: [],
    },

    comments: {
      type: [CommentSchema],
      default: [],
    },

    references: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Bug',
          required: true,
        },

        by: {
          type: UserInfoSchema,
          required: true,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reactions: {
      type: [ReactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Clean JSON output
BugSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

// Auto-increment bugId
BugSchema.plugin(AutoIncrement, {
  inc_field: 'bugId',
  start_seq: 1,
});

// Indexes for efficient querying of bugs by date and status
BugSchema.index({ isOpen: 1 });
BugSchema.index({ createdAt: -1 });

// create the model
const Bug = mongoose.model('Bug', BugSchema); // 

// Validation Function

const validateBug = (bug) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(100).required(),

    body: Joi.string().min(6).max(1000).required(),

    author: Joi.object({
      name: Joi.string().required(),
      username: Joi.string().required(),
    }).required(),

    isOpen: Joi.boolean().default(true),

    labels: Joi.array()
      .items(Joi.string().valid(...VALID_LABELS))
      .default([]),
  });

  return schema.validate(bug);
};

// Validation for Labels (used in label update endpoint)
const validateLabel = (labels) => {
  return Joi.array()
    .items(Joi.string().valid(...VALID_LABELS))
    .validate(labels);
};

// Validation for References (used in reference update endpoint)
const validateReferences = (refs) => {
  const schema = Joi.object({
    references: Joi.array().items(Joi.string().required()).required(),
  });

  return schema.validate(refs);
};

// export the model and validation functions
export {
  Bug,
  validateBug,
  validateLabel,
  validateReferences,
};