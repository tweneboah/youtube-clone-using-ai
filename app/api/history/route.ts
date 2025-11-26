import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import History from '@/models/History';
import { getCurrentUser } from '@/lib/auth';

// GET watch history
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const history = await History.find({ userId: currentUser.userId })
      .sort({ watchedAt: -1 })
      .limit(50)
      .populate({
        path: 'videoId',
        populate: { path: 'userId', select: 'name avatar' },
      })
      .lean();

    return NextResponse.json({
      history: history.filter((h) => h.videoId).map((h) => ({
        _id: h._id.toString(),
        watchedAt: h.watchedAt.toISOString(),
        video: h.videoId,
      })),
    });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST add to history
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert history entry
    await History.findOneAndUpdate(
      { videoId, userId: currentUser.userId },
      { watchedAt: new Date() },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Added to history' });
  } catch (error) {
    console.error('Add to history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

