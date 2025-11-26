import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET current user profile
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
        email: user.email,
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
    await connectDB();

    // Only allow updating certain fields
    const allowedUpdates = ['name', 'description', 'customUrl'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Validate custom URL if provided
    if (filteredUpdates.customUrl) {
      const customUrl = filteredUpdates.customUrl as string;
      
      // Check format - only alphanumeric, underscores, hyphens
      if (!/^@?[a-zA-Z0-9_-]+$/.test(customUrl)) {
        return NextResponse.json(
          { error: 'Custom URL can only contain letters, numbers, underscores, and hyphens' },
          { status: 400 }
        );
      }

      // Add @ prefix if not present
      const finalCustomUrl = customUrl.startsWith('@') ? customUrl : `@${customUrl}`;
      filteredUpdates.customUrl = finalCustomUrl;

      // Check if custom URL is already taken
      const existing = await User.findOne({
        customUrl: finalCustomUrl,
        _id: { $ne: currentUser.userId },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'This custom URL is already taken' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: filteredUpdates },
      { new: true }
    )
      .select('name email avatar banner description customUrl subscribers verified createdAt')
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        description: updatedUser.description,
        customUrl: updatedUser.customUrl,
        subscribers: updatedUser.subscribers,
        verified: updatedUser.verified,
        createdAt: updatedUser.createdAt.toISOString(),
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

