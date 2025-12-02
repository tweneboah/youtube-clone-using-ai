import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import ShortFeed from '@/components/shorts/ShortFeed';
import mongoose from 'mongoose';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { title: 'Short not found' };
    }

    const short = await Short.findById(id)
      .populate('creatorId', 'name')
      .lean();

    if (!short) {
      return { title: 'Short not found' };
    }

    return {
      title: `${short.title} - YouTube Shorts`,
      description: short.description || `Watch this Short by ${short.creatorId.name}`,
      openGraph: {
        title: short.title,
        description: short.description,
        images: [short.thumbnailUrl],
        type: 'video.other',
      },
    };
  } catch {
    return { title: 'YouTube Shorts' };
  }
}

async function getShortWithRelated(id: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { currentShort: null, relatedShorts: [] };
    }

    // Get the current short
    const currentShort = await Short.findById(id)
      .populate('creatorId', 'name avatar verified subscribers')
      .lean();

    if (!currentShort) {
      return { currentShort: null, relatedShorts: [] };
    }

    // Get related shorts (random shorts excluding current)
    const relatedShorts = await Short.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(id) } } },
      { $sample: { size: 19 } },
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

    return {
      currentShort: JSON.parse(JSON.stringify(currentShort)),
      relatedShorts: JSON.parse(JSON.stringify(relatedShorts)),
    };
  } catch (error) {
    console.error('Failed to fetch short:', error);
    return { currentShort: null, relatedShorts: [] };
  }
}

export default async function ShortWatchPage({ params }: PageProps) {
  const { id } = await params;
  const { currentShort, relatedShorts } = await getShortWithRelated(id);

  if (!currentShort) {
    notFound();
  }

  // Combine current short at index 0 with related shorts
  const allShorts = [currentShort, ...relatedShorts];

  return <ShortFeed initialShorts={allShorts} initialIndex={0} />;
}

