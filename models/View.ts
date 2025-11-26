import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IView extends Document {
  _id: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  createdAt: Date;
}

const ViewSchema = new Schema<IView>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries and preventing spam
ViewSchema.index({ videoId: 1, userId: 1 });
ViewSchema.index({ videoId: 1, ipAddress: 1 });
ViewSchema.index({ videoId: 1 });

const View: Model<IView> = mongoose.models.View || mongoose.model<IView>('View', ViewSchema);

export default View;

