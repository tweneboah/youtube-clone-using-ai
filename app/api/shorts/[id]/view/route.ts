import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import View from '@/models/View';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// POST increment view count (with spam prevention)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid short ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const short = await Short.findById(id);
    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    // Get user or IP for spam prevention
    const currentUser = await getCurrentUser();
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check if user/IP has viewed this short recently (within 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const recentView = await View.findOne({
      contentId: id,
      contentType: 'short',
      ...(currentUser ? { userId: currentUser.userId } : { ip }),
      createdAt: { $gte: thirtyMinutesAgo },
    });

    if (!recentView) {
      // Record new view
      await View.create({
        contentId: id,
        contentType: 'short',
        ...(currentUser && { userId: currentUser.userId }),
        ip,
      });

      // Increment view count
      await Short.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    const updatedShort = await Short.findById(id).lean();

    return NextResponse.json({
      views: updatedShort?.views || 0,
    });
  } catch (error) {
    console.error('View short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

