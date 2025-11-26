import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import { getCurrentUser } from '@/lib/auth';

// GET all videos
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    const query = category ? { category } : {};
    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(query),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new video
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, description, thumbnail, videoUrl, duration, category } = await request.json();

    // Validation
    if (!title || !thumbnail || !videoUrl || !duration || !category) {
      return NextResponse.json(
        { error: 'Title, thumbnail, videoUrl, duration, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const video = await Video.create({
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      category,
      userId: currentUser.userId,
    });

    const populatedVideo = await Video.findById(video._id)
      .populate('userId', 'name avatar')
      .lean();

    return NextResponse.json({ video: populatedVideo }, { status: 201 });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

