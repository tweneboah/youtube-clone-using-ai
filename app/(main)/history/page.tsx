import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import VideoGrid from '@/components/VideoGrid';
import connectDB from '@/lib/mongodb';
import History from '@/models/History';
import { PopulatedUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getWatchHistory(userId: string) {
  await connectDB();

  const history = await History.find({ userId })
    .sort({ watchedAt: -1 })
    .limit(50)
    .populate({
      path: 'videoId',
      populate: { path: 'userId', select: 'name avatar' },
    })
    .lean();

  const videos = history
    .filter((h) => h.videoId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((h: any) => {
      const video = h.videoId;
      const creator = video.userId as PopulatedUser;
      return {
        _id: video._id.toString(),
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration,
        views: video.views,
        createdAt: video.createdAt.toISOString(),
        userId: {
          _id: creator._id.toString(),
          name: creator.name,
          avatar: creator.avatar,
        },
      };
    });

  return videos;
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login');
  }

  const videos = await getWatchHistory(userId);

  return (
    <VideoGrid
      videos={videos}
      title="Watch History"
      showViewMore={false}
      currentUserId={userId}
    />
  );
}
