import mongoose, { Schema, Document, Model } from 'mongoose';

export type LikeType = 'like' | 'dislike';

export interface ILike extends Document {
  _id: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: LikeType;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
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
    type: {
      type: String,
      enum: ['like', 'dislike'],
      default: 'like',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique likes/dislikes per user per video
LikeSchema.index({ videoId: 1, userId: 1 }, { unique: true });
LikeSchema.index({ videoId: 1, type: 1 });
LikeSchema.index({ userId: 1 });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);

export default Like;
