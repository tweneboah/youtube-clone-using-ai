import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShort extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: mongoose.Types.ObjectId[];
  creatorId: mongoose.Types.ObjectId;
  soundName?: string;
  hashtags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShortSchema = new Schema<IShort>(
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
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
      max: 60, // Max 60 seconds for shorts
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    soundName: {
      type: String,
      trim: true,
      maxlength: [100, 'Sound name cannot exceed 100 characters'],
    },
    hashtags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ShortSchema.index({ creatorId: 1 });
ShortSchema.index({ createdAt: -1 }); // For feed sorting
ShortSchema.index({ views: -1 }); // For trending
ShortSchema.index({ title: 'text', description: 'text', hashtags: 'text' });

const Short: Model<IShort> = mongoose.models.Short || mongoose.model<IShort>('Short', ShortSchema);

export default Short;

