import { NextRequest, NextResponse } from 'next/server';
import { uploadShortVideo, uploadShortThumbnail, generateVideoThumbnail } from '@/lib/cloudinary';
import { getCurrentUser } from '@/lib/auth';

interface CloudinaryResult {
  secure_url: string;
  duration?: number;
  width?: number;
  height?: number;
}

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
    const video = formData.get('video') as File | null;
    const thumbnail = formData.get('thumbnail') as File | null;

    if (!video) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validate video size (max 100MB for shorts)
    if (video.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video must be less than 100MB' },
        { status: 400 }
      );
    }

    // Convert video to buffer
    const videoBuffer = Buffer.from(await video.arrayBuffer());

    // Upload video to Cloudinary
    const videoResult = await uploadShortVideo(videoBuffer) as CloudinaryResult;

    // Check video duration (max 60 seconds)
    if (videoResult.duration && videoResult.duration > 60) {
      return NextResponse.json(
        { error: 'Shorts must be 60 seconds or less' },
        { status: 400 }
      );
    }

    // Validate aspect ratio (should be vertical 9:16 or close)
    if (videoResult.width && videoResult.height) {
      const aspectRatio = videoResult.width / videoResult.height;
      // Allow some tolerance for vertical videos (anything taller than wide)
      if (aspectRatio > 1) {
        return NextResponse.json(
          { error: 'Shorts must be vertical (9:16 aspect ratio)' },
          { status: 400 }
        );
      }
    }

    let thumbnailUrl: string;

    if (thumbnail) {
      // Upload custom thumbnail
      const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());
      const thumbnailResult = await uploadShortThumbnail(thumbnailBuffer) as CloudinaryResult;
      thumbnailUrl = thumbnailResult.secure_url;
    } else {
      // Generate thumbnail from video
      thumbnailUrl = generateVideoThumbnail(videoResult.secure_url, 0);
    }

    return NextResponse.json({
      videoUrl: videoResult.secure_url,
      thumbnailUrl,
      duration: Math.round(videoResult.duration || 0),
      width: videoResult.width,
      height: videoResult.height,
    });
  } catch (error) {
    console.error('Short upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

