import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { PopulatedUser } from '@/lib/types';

// GET comments for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    await connectDB();

    const comments = await Comment.find({ videoId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comments: comments.map((c: any) => {
        const user = c.userId as PopulatedUser;
        return {
          _id: c._id.toString(),
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          userId: {
            _id: user._id.toString(),
            name: user.name,
            avatar: user.avatar,
          },
        };
      }),
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
