import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LiveChatMessage from '@/models/LiveChatMessage';
import LiveStream from '@/models/LiveStream';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-options';
import { broadcastMessage, ChatMessage } from '@/lib/pusher';

// POST /api/live/chat/send - Send a chat message
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

    const { streamId, message } = await request.json();

    if (!streamId || !message) {
      return NextResponse.json(
        { error: 'Stream ID and message are required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if stream exists and is live
    const stream = await LiveStream.findById(streamId);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    if (!stream.isLive || stream.ended) {
      return NextResponse.json(
        { error: 'Stream is not live' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await User.findById(userId).select('name avatar');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Save message to database
    const chatMessage = new LiveChatMessage({
      streamId,
      userId,
      message: message.trim(),
      timestamp: new Date(),
    });

    await chatMessage.save();

    // Broadcast message via Pusher
    const broadcastData: ChatMessage = {
      id: chatMessage._id.toString(),
      streamId,
      userId,
      userName: user.name,
      userAvatar: user.avatar || undefined,
      message: message.trim(),
      timestamp: chatMessage.timestamp.toISOString(),
    };

    await broadcastMessage(streamId, broadcastData);

    return NextResponse.json({
      success: true,
      message: broadcastData,
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

