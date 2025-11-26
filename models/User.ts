import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  banner: string;
  description: string;
  customUrl?: string;
  oauthProvider?: 'google' | 'github';
  oauthId?: string;
  subscribers: number;
  subscriptions: mongoose.Types.ObjectId[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    customUrl: {
      type: String,
      trim: true,
      sparse: true,
    },
    oauthProvider: {
      type: String,
      enum: ['google', 'github'],
    },
    oauthId: {
      type: String,
    },
    subscribers: {
      type: Number,
      default: 0,
    },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (email index is created by unique: true)
UserSchema.index({ oauthProvider: 1, oauthId: 1 });
UserSchema.index({ customUrl: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
