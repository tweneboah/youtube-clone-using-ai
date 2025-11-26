import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHistory extends Document {
  _id: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  watchedAt: Date;
}

const HistorySchema = new Schema<IHistory>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
HistorySchema.index({ userId: 1, watchedAt: -1 });
HistorySchema.index({ videoId: 1, userId: 1 });

const History: Model<IHistory> = mongoose.models.History || mongoose.model<IHistory>('History', HistorySchema);

export default History;

