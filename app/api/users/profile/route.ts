import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET user profile
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

    const user = await User.findById(currentUser.userId)
      .select('name email avatar banner description customUrl subscribers subscriptions')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        banner: user.banner || '',
        description: user.description || '',
        customUrl: user.customUrl || '',
        subscribers: user.subscribers || 0,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const allowedUpdates = ['name', 'description', 'customUrl'];
    const filteredUpdates: Record<string, string> = {};

    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Validate customUrl if provided
    if (filteredUpdates.customUrl) {
      // Add @ prefix if not present
      if (!filteredUpdates.customUrl.startsWith('@')) {
        filteredUpdates.customUrl = `@${filteredUpdates.customUrl}`;
      }
      
      // Check if customUrl is already taken by another user
      await connectDB();
      const existingUser = await User.findOne({
        customUrl: filteredUpdates.customUrl,
        _id: { $ne: currentUser.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'This handle is already taken' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: filteredUpdates },
      { new: true }
    ).select('name email avatar banner description customUrl subscribers');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        banner: user.banner || '',
        description: user.description || '',
        customUrl: user.customUrl || '',
        subscribers: user.subscribers || 0,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
