import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import mongoose from 'mongoose';

// GET shorts by channel/user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'latest'; // 'latest', 'popular'
    const skip = (page - 1) * limit;

    await connectDB();

    let sortQuery = {};
    if (sort === 'popular') {
      sortQuery = { views: -1, createdAt: -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }

    const [shorts, total] = await Promise.all([
      Short.find({ creatorId: userId })
        .populate('creatorId', 'name avatar verified')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Short.countDocuments({ creatorId: userId }),
    ]);

    return NextResponse.json({
      shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get channel shorts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

