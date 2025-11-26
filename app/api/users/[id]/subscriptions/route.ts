import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { PopulatedUser } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    await connectDB();

    const user = await User.findById(userId)
      .populate('subscriptions', 'name avatar subscribers')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptions = ((user as any).subscriptions || []).map((sub: PopulatedUser & { subscribers: number }) => ({
      _id: sub._id.toString(),
      name: sub.name,
      avatar: sub.avatar,
      subscribers: sub.subscribers,
    }));

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
