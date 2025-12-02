import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LiveStream from '@/models/LiveStream';
import { authOptions } from '@/lib/auth-options';
import { broadcastStreamStart } from '@/lib/pusher';

// PATCH /api/live/start - Mark stream as live
export async function PATCH(request: NextRequest) {
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

    const { streamId } = await request.json();

    if (!streamId) {
      return NextResponse.json(
        { error: 'Stream ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const stream = await LiveStream.findOne({
      _id: streamId,
      creatorId: userId,
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found or unauthorized' },
        { status: 404 }
      );
    }

    if (stream.ended) {
      return NextResponse.json(
        { error: 'Cannot start an ended stream' },
        { status: 400 }
      );
    }

    // Update stream status
    stream.isLive = true;
    await stream.save();

    // Broadcast stream start event
    await broadcastStreamStart(streamId);

    return NextResponse.json({
      success: true,
      stream: {
        _id: stream._id,
        isLive: stream.isLive,
      },
    });
  } catch (error) {
    console.error('Start live stream error:', error);
    return NextResponse.json(
      { error: 'Failed to start live stream' },
      { status: 500 }
    );
  }
}

