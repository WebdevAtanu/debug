import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference to User model
      required: true,
      ref: 'User', // populate with user details when needed
      index: true, // index for faster lookups by user
    },

    token: {
      type: String,
      required: true,
      unique: true, // prevent duplicate tokens
    },

    type: {
      type: String,
      enum: ['verify', 'reset', 'refresh'], // token types for different purposes
      default: 'verify',
    },
  },
  { timestamps: true }
);

// TTL Index (Auto delete expired tokens)
TokenSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * parseInt(process.env.EXPIRATION_TIME || 60),
  }
);

// auto remove old tokens for same user/type
TokenSchema.index({ user: 1, type: 1 });

// create the model
const Token = mongoose.model('Token', TokenSchema);

export { Token };