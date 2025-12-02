import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Short from '@/models/Short';
import ShortFeed from '@/components/shorts/ShortFeed';

export const metadata: Metadata = {
  title: 'Shorts - YouTube Clone',
  description: 'Watch vertical short videos',
};

async function getShorts() {
  try {
    await connectDB();

    const shorts = await Short.aggregate([
      { $sample: { size: 20 } },
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

    return JSON.parse(JSON.stringify(shorts));
  } catch (error) {
    console.error('Failed to fetch shorts:', error);
    return [];
  }
}

export default async function ShortsPage() {
  const shorts = await getShorts();

  if (shorts.length === 0) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#909090]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0F0F0F] mb-2">No Shorts yet</h2>
          <p className="text-[#606060] mb-4">Be the first to upload a Short!</p>
          <a
            href="/upload/short"
            className="inline-block px-6 py-2 bg-[#FF0000] text-white rounded-full font-medium hover:bg-[#CC0000] transition-colors"
          >
            Create Short
          </a>
        </div>
      </div>
    );
  }

  return <ShortFeed initialShorts={shorts} />;
}

