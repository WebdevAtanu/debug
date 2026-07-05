import mongoose from 'mongoose';

// Reaction Schema
const ReactionSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    emoji: {
      type: String,
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

export default ReactionSchema;
