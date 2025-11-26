import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import View from '@/models/View';
import History from '@/models/History';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const currentUser = await getCurrentUser();
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check if view already exists (prevent spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    let existingView;
    if (currentUser) {
      existingView = await View.findOne({
        videoId: id,
        userId: currentUser.userId,
        createdAt: { $gte: oneHourAgo },
      });
    } else {
      existingView = await View.findOne({
        videoId: id,
        ipAddress: ip,
        createdAt: { $gte: oneHourAgo },
      });
    }

    if (!existingView) {
      // Create new view
      await View.create({
        videoId: id,
        userId: currentUser?.userId,
        ipAddress: ip,
      });

      // Increment view count
      await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    // Add to history if user is logged in
    if (currentUser) {
      await History.findOneAndUpdate(
        { videoId: id, userId: currentUser.userId },
        { watchedAt: new Date() },
        { upsert: true }
      );
    }

    return NextResponse.json({ message: 'View recorded' });
  } catch (error) {
    console.error('Record view error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

