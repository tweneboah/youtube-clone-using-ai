import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILiveChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  streamId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
  createdAt: Date;
}

const LiveChatMessageSchema = new Schema<ILiveChatMessage>(
  {
    streamId: {
      type: Schema.Types.ObjectId,
      ref: 'LiveStream',
      required: [true, 'Stream ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
LiveChatMessageSchema.index({ streamId: 1, timestamp: -1 });
LiveChatMessageSchema.index({ userId: 1 });

const LiveChatMessage: Model<ILiveChatMessage> =
  mongoose.models.LiveChatMessage ||
  mongoose.model<ILiveChatMessage>('LiveChatMessage', LiveChatMessageSchema);

export default LiveChatMessage;

