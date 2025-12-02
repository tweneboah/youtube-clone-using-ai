import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET user/channel data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id)
      .select('name email avatar banner description customUrl subscribers verified createdAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
        banner: user.banner,
        description: user.description,
        customUrl: user.customUrl,
        subscribers: user.subscribers,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







