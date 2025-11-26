import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { uploadAvatar, uploadBanner } from '@/lib/cloudinary';

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

// POST upload profile image (avatar or banner)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['avatar', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "avatar" or "banner"' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for banner
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${type === 'avatar' ? '5MB' : '10MB'}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    let result: CloudinaryResult;
    if (type === 'avatar') {
      result = await uploadAvatar(buffer, currentUser.userId) as CloudinaryResult;
    } else {
      result = await uploadBanner(buffer, currentUser.userId) as CloudinaryResult;
    }

    // Update user in database
    await connectDB();
    
    const updateField = type === 'avatar' ? { avatar: result.secure_url } : { banner: result.secure_url };
    
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateField },
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
      url: result.secure_url,
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
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE remove profile image
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['avatar', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "avatar" or "banner"' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateField = type === 'avatar' ? { avatar: '' } : { banner: '' };

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateField },
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
      message: `${type === 'avatar' ? 'Avatar' : 'Banner'} removed successfully`,
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
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
}



