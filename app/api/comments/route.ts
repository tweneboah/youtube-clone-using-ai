import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { PopulatedUser } from '@/lib/types';

// POST create a new comment
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { videoId, content } = await request.json();

    if (!videoId || !content) {
      return NextResponse.json(
        { error: 'Video ID and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.create({
      videoId,
      content,
      userId: currentUser.userId,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name avatar')
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (populatedComment as any).userId as PopulatedUser;

    return NextResponse.json({
      comment: {
        _id: populatedComment!._id.toString(),
        content: populatedComment!.content,
        createdAt: populatedComment!.createdAt.toISOString(),
        userId: {
          _id: user._id.toString(),
          name: user.name,
          avatar: user.avatar,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
