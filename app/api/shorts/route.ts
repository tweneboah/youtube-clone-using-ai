import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import { getCurrentUser } from '@/lib/auth';

// GET shorts feed
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'latest'; // 'latest', 'trending', 'random'

    const skip = (page - 1) * limit;

    let sortQuery = {};
    let shorts;

    if (sort === 'trending') {
      sortQuery = { views: -1, createdAt: -1 };
      shorts = await Short.find()
        .populate('creatorId', 'name avatar verified')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();
    } else if (sort === 'random') {
      // Random feed using aggregation
      shorts = await Short.aggregate([
        { $sample: { size: limit } },
        {
          $lookup: {
            from: 'users',
            localField: 'creatorId',
            foreignField: '_id',
            as: 'creatorId',
          },
        },
        { $unwind: '$creatorId' },
        {
          $project: {
            title: 1,
            description: 1,
            videoUrl: 1,
            thumbnailUrl: 1,
            duration: 1,
            views: 1,
            likes: 1,
            hashtags: 1,
            soundName: 1,
            createdAt: 1,
            'creatorId._id': 1,
            'creatorId.name': 1,
            'creatorId.avatar': 1,
            'creatorId.verified': 1,
          },
        },
      ]);
    } else {
      // Default: latest
      sortQuery = { createdAt: -1 };
      shorts = await Short.find()
        .populate('creatorId', 'name avatar verified')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const total = await Short.countDocuments();

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
    console.error('Get shorts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new short
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, description, videoUrl, thumbnailUrl, duration, soundName, hashtags } = await request.json();

    // Validation
    if (!title || !videoUrl || !thumbnailUrl || !duration) {
      return NextResponse.json(
        { error: 'Title, videoUrl, thumbnailUrl, and duration are required' },
        { status: 400 }
      );
    }

    // Shorts must be 60 seconds or less
    if (duration > 60) {
      return NextResponse.json(
        { error: 'Shorts must be 60 seconds or less' },
        { status: 400 }
      );
    }

    await connectDB();

    const short = await Short.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      soundName,
      hashtags: hashtags || [],
      creatorId: currentUser.userId,
    });

    const populatedShort = await Short.findById(short._id)
      .populate('creatorId', 'name avatar verified')
      .lean();

    return NextResponse.json({ short: populatedShort }, { status: 201 });
  } catch (error) {
    console.error('Create short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

