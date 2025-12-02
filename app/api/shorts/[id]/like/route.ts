import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// POST toggle like on a short
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid short ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const short = await Short.findById(id);
    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(currentUser.userId);
    const isLiked = short.likes.some((like: mongoose.Types.ObjectId) => 
      like.toString() === currentUser.userId
    );

    if (isLiked) {
      // Unlike
      await Short.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });
    } else {
      // Like
      await Short.findByIdAndUpdate(id, {
        $addToSet: { likes: userId },
      });
    }

    const updatedShort = await Short.findById(id)
      .populate('creatorId', 'name avatar verified')
      .lean();

    return NextResponse.json({
      liked: !isLiked,
      likesCount: updatedShort?.likes?.length || 0,
    });
  } catch (error) {
    console.error('Like short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET like status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid short ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const short = await Short.findById(id).lean();
    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    const currentUser = await getCurrentUser();
    let isLiked = false;

    if (currentUser) {
      isLiked = short.likes.some((like: mongoose.Types.ObjectId) => 
        like.toString() === currentUser.userId
      );
    }

    return NextResponse.json({
      liked: isLiked,
      likesCount: short.likes?.length || 0,
    });
  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

