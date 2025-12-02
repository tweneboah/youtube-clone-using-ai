import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LiveStream from '@/models/LiveStream';
import { broadcastViewerCount } from '@/lib/pusher';

// POST /api/live/[streamId]/viewers - Update viewer count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;
    const { action } = await request.json(); // 'join' or 'leave'

    await connectDB();

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Update viewer count
    if (action === 'join') {
      stream.viewers += 1;
      if (stream.viewers > stream.peakViewers) {
        stream.peakViewers = stream.viewers;
      }
    } else if (action === 'leave' && stream.viewers > 0) {
      stream.viewers -= 1;
    }

    await stream.save();

    // Broadcast updated viewer count
    await broadcastViewerCount(streamId, stream.viewers);

    return NextResponse.json({
      viewers: stream.viewers,
    });
  } catch (error) {
    console.error('Update viewers error:', error);
    return NextResponse.json(
      { error: 'Failed to update viewers' },
      { status: 500 }
    );
  }
}

// GET /api/live/[streamId]/viewers - Get viewer count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;

    await connectDB();

    const stream = await LiveStream.findById(streamId).select('viewers peakViewers');

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      viewers: stream.viewers,
      peakViewers: stream.peakViewers,
    });
  } catch (error) {
    console.error('Get viewers error:', error);
    return NextResponse.json(
      { error: 'Failed to get viewers' },
      { status: 500 }
    );
  }
}

