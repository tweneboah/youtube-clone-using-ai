import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LiveStream from '@/models/LiveStream';
import { authOptions } from '@/lib/auth-options';
import { createLivepeerStream } from '@/lib/livepeer';
import { uploadImage } from '@/lib/cloudinary';

// POST /api/live/create - Create a new live stream
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const category = formData.get('category') as string || 'Live';
    const thumbnailFile = formData.get('thumbnail') as File | null;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create Livepeer stream
    const livepeerResponse = await createLivepeerStream(title);

    // Upload thumbnail if provided
    let thumbnailUrl = '';
    if (thumbnailFile && thumbnailFile.size > 0) {
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadImage(buffer, 'live-thumbnails') as { secure_url: string };
      thumbnailUrl = result.secure_url;
    }

    // Create stream in database
    const stream = new LiveStream({
      title: title.trim(),
      description: description.trim(),
      creatorId: userId,
      thumbnailUrl,
      playbackId: livepeerResponse.playbackId,
      playbackUrl: livepeerResponse.playbackUrl,
      ingestUrl: livepeerResponse.ingestUrl,
      streamKey: livepeerResponse.streamKey,
      category,
      livepeerStreamId: livepeerResponse.streamId,
      isLive: false,
      ended: false,
    });

    await stream.save();

    // Populate creator info before returning
    await stream.populate('creatorId', 'name avatar verified');

    return NextResponse.json({
      stream: {
        _id: stream._id,
        title: stream.title,
        description: stream.description,
        thumbnailUrl: stream.thumbnailUrl,
        playbackId: stream.playbackId,
        playbackUrl: stream.playbackUrl,
        ingestUrl: stream.ingestUrl,
        streamKey: stream.streamKey,
        category: stream.category,
        isLive: stream.isLive,
        ended: stream.ended,
        creatorId: stream.creatorId,
        createdAt: stream.createdAt,
      },
    });
  } catch (error) {
    console.error('Create live stream error:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    );
  }
}

