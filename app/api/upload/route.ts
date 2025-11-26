import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
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

    // Upload video to Cloudinary
    const videoBuffer = Buffer.from(await video.arrayBuffer());
    const videoResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'youtube-clone/videos',
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(videoBuffer);
    });

    let thumbnailUrl = '';
    
    if (thumbnail) {
      // Upload custom thumbnail
      const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());
      const thumbnailResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'youtube-clone/thumbnails',
            transformation: [
              { width: 640, height: 360, crop: 'fill' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        ).end(thumbnailBuffer);
      });
      thumbnailUrl = thumbnailResult.secure_url;
    } else {
      // Generate thumbnail from video
      const videoPublicId = videoResult.public_id;
      thumbnailUrl = cloudinary.url(videoPublicId, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 640, height: 360, crop: 'fill' },
          { start_offset: '1' },
        ],
      });
    }

    return NextResponse.json({
      videoUrl: videoResult.secure_url,
      thumbnailUrl,
      duration: videoResult.duration || 0,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

