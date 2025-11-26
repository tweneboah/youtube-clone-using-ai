import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import VideoGrid from '@/components/VideoGrid';
import connectDB from '@/lib/mongodb';
import Like from '@/models/Like';
import { PopulatedUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getLikedVideos(userId: string) {
  await connectDB();

  // Find likes with type='like' or without type field (old records)
  const likes = await Like.find({ userId, $or: [{ type: 'like' }, { type: { $exists: false } }] })
    .sort({ createdAt: -1 })
    .populate({
      path: 'videoId',
      populate: { path: 'userId', select: 'name avatar' },
    })
    .lean();

  const videos = likes
    .filter((l) => l.videoId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any) => {
      const video = l.videoId;
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

export default async function LikedVideosPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login');
  }

  const videos = await getLikedVideos(userId);

  return (
    <VideoGrid videos={videos} title="Liked Videos" showViewMore={false} />
  );
}
