import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import History from '@/models/History';
import { getCurrentUser } from '@/lib/auth';

// GET single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const video = await Video.findById(id)
      .populate('userId', 'name avatar subscribers')
      .lean();

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update video
export async function PATCH(
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
    const updates = await request.json();

    await connectDB();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (video.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'description', 'thumbnail', 'category'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true }
    )
      .populate('userId', 'name avatar')
      .lean();

    return NextResponse.json({ video: updatedVideo });
  } catch (error) {
    console.error('Update video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE video
export async function DELETE(
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
    await connectDB();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (video.userId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Delete video and all related data
    await Promise.all([
      Video.findByIdAndDelete(id),
      Comment.deleteMany({ videoId: id }),
      Like.deleteMany({ videoId: id }),
      History.deleteMany({ videoId: id }),
    ]);

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
