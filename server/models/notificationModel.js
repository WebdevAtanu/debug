import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['MENTIONED', 'COMMENTED', 'BUG_STATUS', 'NEW_BUG', 'REFERENCED'],
      required: true,
    },

    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Bug references
    fromBug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
    },

    onBug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
    },

    bugStatus: {
      type: String,
      enum: ['opened', 'closed'],
    },

    references: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bug',
        default: [],
      },
    ],

    mentions: {
      type: [String], // or ObjectId if linking users
      default: [],
    },

    notificationTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // IMPORTANT FIELD
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Transform _id to id and remove __v for cleaner API responses
NotificationSchema.set('toJSON', {
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

// Indexes for efficient querying of notifications by recipient and read status
NotificationSchema.index({ notificationTo: 1 });
NotificationSchema.index({ createdAt: -1 });

// create the model
const Notification = mongoose.model('Notification', NotificationSchema);

export { Notification };