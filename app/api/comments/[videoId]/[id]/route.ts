import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { PopulatedUser } from '@/lib/types';

// GET single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string; id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const comment = await Comment.findById(id)
      .populate('userId', 'name avatar')
      .lean();

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (comment as any).userId as PopulatedUser;

    return NextResponse.json({
      comment: {
        _id: comment._id.toString(),
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        userId: {
          _id: user._id.toString(),
          name: user.name,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Get comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string; id: string }> }
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
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (comment.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true }
    )
      .populate('userId', 'name avatar')
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (updatedComment as any).userId as PopulatedUser;

    return NextResponse.json({
      comment: {
        _id: updatedComment!._id.toString(),
        content: updatedComment!.content,
        createdAt: updatedComment!.createdAt.toISOString(),
        updatedAt: updatedComment!.updatedAt.toISOString(),
        userId: {
          _id: user._id.toString(),
          name: user.name,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string; id: string }> }
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
    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (comment.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
