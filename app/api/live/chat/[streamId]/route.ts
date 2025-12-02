import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LiveChatMessage from '@/models/LiveChatMessage';

// GET /api/live/chat/[streamId] - Get chat history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const before = searchParams.get('before'); // Timestamp for pagination

    await connectDB();

    const query: Record<string, unknown> = { streamId };
    
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await LiveChatMessage.find(query)
      .populate('userId', 'name avatar')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Format messages for response
    interface PopulatedUser {
      _id: { toString(): string };
      name: string;
      avatar?: string;
    }

    const formattedMessages = messages.reverse().map((msg) => {
      const user = msg.userId as unknown as PopulatedUser | null;
      const isPopulated = user && typeof user === 'object' && 'name' in user;
      
      return {
        id: msg._id.toString(),
        streamId: msg.streamId.toString(),
        userId: isPopulated ? user._id.toString() : String(msg.userId),
        userName: isPopulated ? user.name : 'Unknown',
        userAvatar: isPopulated ? user.avatar : undefined,
        message: msg.message,
        timestamp: msg.timestamp.toISOString(),
      };
    });

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

