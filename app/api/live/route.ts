import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import LiveStream from '@/models/LiveStream';
import { authOptions } from '@/lib/auth-options';

// GET /api/live - Get all live streams or user's streams
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const liveOnly = searchParams.get('liveOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: Record<string, unknown> = {};
    
    if (userId) {
      query.creatorId = userId;
    }
    
    if (liveOnly) {
      query.isLive = true;
      query.ended = false;
    }

    const streams = await LiveStream.find(query)
      .populate('creatorId', 'name avatar verified')
      .sort({ isLive: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ streams });
  } catch (error) {
    console.error('Get live streams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}

