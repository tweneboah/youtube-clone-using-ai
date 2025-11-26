import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

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

    const { id: channelId } = await params;

    await connectDB();

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Remove from subscriptions and decrement subscriber count
    await Promise.all([
      User.findByIdAndUpdate(currentUser.userId, {
        $pull: { subscriptions: channelId },
      }),
      User.findByIdAndUpdate(channelId, {
        $inc: { subscribers: -1 },
      }),
    ]);

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

