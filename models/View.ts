import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IView extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentType: 'video' | 'short';
  userId?: mongoose.Types.ObjectId;
  ip?: string;
  createdAt: Date;
}

const ViewSchema = new Schema<IView>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Content ID is required'],
      refPath: 'contentType',
    },
    contentType: {
      type: String,
      enum: ['video', 'short'],
      default: 'video',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries and preventing spam
ViewSchema.index({ contentId: 1, contentType: 1, userId: 1 });
ViewSchema.index({ contentId: 1, contentType: 1, ip: 1 });
ViewSchema.index({ contentId: 1, contentType: 1 });
ViewSchema.index({ createdAt: 1 });

const View: Model<IView> = mongoose.models.View || mongoose.model<IView>('View', ViewSchema);

export default View;
