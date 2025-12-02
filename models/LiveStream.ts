import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILiveStream extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  creatorId: mongoose.Types.ObjectId;
  thumbnailUrl: string;
  playbackId: string;
  playbackUrl: string;
  ingestUrl: string;
  streamKey: string;
  isLive: boolean;
  ended: boolean;
  viewers: number;
  peakViewers: number;
  category: string;
  livepeerStreamId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    playbackId: {
      type: String,
      required: true,
    },
    playbackUrl: {
      type: String,
      required: true,
    },
    ingestUrl: {
      type: String,
      required: true,
    },
    streamKey: {
      type: String,
      required: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    ended: {
      type: Boolean,
      default: false,
    },
    viewers: {
      type: Number,
      default: 0,
    },
    peakViewers: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: 'Live',
      trim: true,
    },
    livepeerStreamId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
LiveStreamSchema.index({ creatorId: 1 });
LiveStreamSchema.index({ isLive: 1 });
LiveStreamSchema.index({ ended: 1 });
LiveStreamSchema.index({ createdAt: -1 });

const LiveStream: Model<ILiveStream> =
  mongoose.models.LiveStream || mongoose.model<ILiveStream>('LiveStream', LiveStreamSchema);

export default LiveStream;

