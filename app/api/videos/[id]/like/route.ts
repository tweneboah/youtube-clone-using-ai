import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import Like, { LikeType } from '@/models/Like';
import { getCurrentUser } from '@/lib/auth';

// POST toggle like/dislike
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
    const body = await request.json().catch(() => ({}));
    const type: LikeType = body.type || 'like';

    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "like" or "dislike"' },
        { status: 400 }
      );
    }

    await connectDB();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check for existing like/dislike
    const existingLike = await Like.findOne({
      videoId: id,
      userId: currentUser.userId,
    });

    let userAction: 'liked' | 'disliked' | null = null;

    if (existingLike) {
      // Get current type (default to 'like' for old records without type field)
      const currentType = existingLike.type || 'like';
      
      if (currentType === type) {
        // Same type - remove the like/dislike (toggle off)
        await Like.deleteOne({ _id: existingLike._id });
        userAction = null;
      } else {
        // Different type - update to new type
        existingLike.type = type;
        await existingLike.save();
        userAction = type === 'like' ? 'liked' : 'disliked';
      }
    } else {
      // No existing like - create new
      await Like.create({
        videoId: id,
        userId: currentUser.userId,
        type,
      });
      userAction = type === 'like' ? 'liked' : 'disliked';
    }

    // Get updated counts - count likes with type='like' or without type field (old records)
    const [likeCount, dislikeCount] = await Promise.all([
      Like.countDocuments({ videoId: id, $or: [{ type: 'like' }, { type: { $exists: false } }] }),
      Like.countDocuments({ videoId: id, type: 'dislike' }),
    ]);

    return NextResponse.json({
      userAction,
      likeCount,
      dislikeCount,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET likes/dislikes info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Count likes with type='like' or without type field (old records)
    const [likeCount, dislikeCount] = await Promise.all([
      Like.countDocuments({ videoId: id, $or: [{ type: 'like' }, { type: { $exists: false } }] }),
      Like.countDocuments({ videoId: id, type: 'dislike' }),
    ]);

    let userAction: 'liked' | 'disliked' | null = null;
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      const existingLike = await Like.findOne({
        videoId: id,
        userId: currentUser.userId,
      });
      if (existingLike) {
        // Handle old records without type field
        const likeType = existingLike.type || 'like';
        userAction = likeType === 'like' ? 'liked' : 'disliked';
      }
    }

    return NextResponse.json({ userAction, likeCount, dislikeCount });
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
