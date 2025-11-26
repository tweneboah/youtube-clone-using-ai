import VideoGrid from '@/components/VideoGrid';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import { formatVideo } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getTrendingVideos() {
  await connectDB();

  // Get videos sorted by views in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const videos = await Video.find({ createdAt: { $gte: oneWeekAgo } })
    .populate('userId', 'name avatar')
    .sort({ views: -1 })
    .limit(24)
    .lean();

  // If not enough recent videos, get top viewed videos overall
  if (videos.length < 12) {
    const allVideos = await Video.find()
      .populate('userId', 'name avatar')
      .sort({ views: -1 })
      .limit(24)
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allVideos.map((v: any) => formatVideo(v));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return videos.map((v: any) => formatVideo(v));
}

export default async function TrendingPage() {
  const videos = await getTrendingVideos();
  const currentUser = await getCurrentUser();

  return (
    <VideoGrid
      videos={videos}
      title="Trending"
      showViewMore={false}
      currentUserId={currentUser?.userId || null}
    />
  );
}
