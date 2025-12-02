import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['avatar', 'banner'].includes(type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `youtube-clone/${type}s`,
          resource_type: 'image',
          transformation: type === 'avatar' 
            ? { width: 200, height: 200, crop: 'fill', gravity: 'face' }
            : { width: 2048, height: 1152, crop: 'fill' },
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(buffer);
    });

    const uploadResult = await uploadPromise;

    await connectDB();

    // Update user with new image URL
    const updateField = type === 'avatar' ? { avatar: uploadResult.secure_url } : { banner: uploadResult.secure_url };
    
    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateField },
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
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE remove profile image (avatar or banner)
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

    if (!['avatar', 'banner'].includes(type || '')) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    await connectDB();

    const updateField = type === 'avatar' ? { avatar: '' } : { banner: '' };
    
    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateField },
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
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
