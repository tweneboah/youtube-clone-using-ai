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

    if (currentUser.userId === channelId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check if already subscribed
    const user = await User.findById(currentUser.userId);
    const isAlreadySubscribed = user?.subscriptions?.some(
      (subId: { toString: () => string }) => subId.toString() === channelId
    );
    
    if (isAlreadySubscribed) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Add to subscriptions and increment subscriber count
    await Promise.all([
      User.findByIdAndUpdate(currentUser.userId, {
        $addToSet: { subscriptions: channelId },
      }),
      User.findByIdAndUpdate(channelId, {
        $inc: { subscribers: 1 },
      }),
    ]);

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
