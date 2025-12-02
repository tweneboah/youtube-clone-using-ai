import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LiveStream from '@/models/LiveStream';
import { authOptions } from '@/lib/auth-options';
import { checkStreamStatus } from '@/lib/livepeer';

// GET /api/live/[streamId] - Get stream details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;
    
    await connectDB();

    const stream = await LiveStream.findById(streamId)
      .populate('creatorId', 'name avatar verified subscribers')
      .lean();

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Check live status from Livepeer if stream is supposed to be live
    let isActuallyLive = stream.isLive;
    if (stream.isLive && !stream.ended) {
      const status = await checkStreamStatus(stream.livepeerStreamId);
      isActuallyLive = status.isActive;
    }

    return NextResponse.json({
      stream: {
        ...stream,
        isLive: isActuallyLive,
      },
    });
  } catch (error) {
    console.error('Get live stream error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live stream' },
      { status: 500 }
    );
  }
}

// PATCH /api/live/[streamId] - Update stream details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    const { streamId } = await params;

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

    const body = await request.json();
    const { title, description, category } = body;

    if (title) stream.title = title.trim();
    if (description !== undefined) stream.description = description.trim();
    if (category) stream.category = category;

    await stream.save();

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('Update live stream error:', error);
    return NextResponse.json(
      { error: 'Failed to update live stream' },
      { status: 500 }
    );
  }
}

// DELETE /api/live/[streamId] - Delete stream
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    const { streamId } = await params;

    await connectDB();

    const stream = await LiveStream.findOneAndDelete({
      _id: streamId,
      creatorId: userId,
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete live stream error:', error);
    return NextResponse.json(
      { error: 'Failed to delete live stream' },
      { status: 500 }
    );
  }
}

