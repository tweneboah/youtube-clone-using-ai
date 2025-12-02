import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// GET single short
export async function GET(
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

    const short = await Short.findById(id)
      .populate('creatorId', 'name avatar verified subscribers')
      .lean();

    if (!short) {
      return NextResponse.json(
        { error: 'Short not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ short });
  } catch (error) {
    console.error('Get short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update short
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // Check ownership
    if (short.creatorId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { title, description, hashtags } = await request.json();

    const updatedShort = await Short.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(hashtags && { hashtags }),
      },
      { new: true }
    )
      .populate('creatorId', 'name avatar verified')
      .lean();

    return NextResponse.json({ short: updatedShort });
  } catch (error) {
    console.error('Update short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE short
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // Check ownership
    if (short.creatorId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await Short.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Short deleted successfully' });
  } catch (error) {
    console.error('Delete short error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

