import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Link from 'next/link';
import VideoGrid from '@/components/VideoGrid';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import History from '@/models/History';
import Like from '@/models/Like';
import { AiOutlineHistory, AiOutlineLike } from 'react-icons/ai';
import { HiOutlineVideoCamera } from 'react-icons/hi2';
import { formatVideo, PopulatedUser, SerializedVideo } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getLibraryData(userId: string) {
  await connectDB();

  // Get user's videos
  const userVideos = await Video.find({ userId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  // Get recent history
  const history = await History.find({ userId })
    .sort({ watchedAt: -1 })
    .limit(8)
    .populate({
      path: 'videoId',
      populate: { path: 'userId', select: 'name avatar' },
    })
    .lean();

  // Get liked videos (only likes, not dislikes) - handle old records without type field
  const likes = await Like.find({ userId, $or: [{ type: 'like' }, { type: { $exists: false } }] })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate({
      path: 'videoId',
      populate: { path: 'userId', select: 'name avatar' },
    })
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatNestedVideo = (item: any): SerializedVideo | null => {
    if (!item.videoId) return null;
    const video = item.videoId;
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
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userVideos: userVideos.map((v: any) => formatVideo(v)),
    historyVideos: history.map(formatNestedVideo).filter((v): v is SerializedVideo => v !== null),
    likedVideos: likes.map(formatNestedVideo).filter((v): v is SerializedVideo => v !== null),
  };
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login');
  }

  const { userVideos, historyVideos, likedVideos } = await getLibraryData(userId);

  return (
    <div className="space-y-8">
      {/* Quick Links */}
      <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-[#111111] mb-4">Library</h2>
        <div className="flex gap-4">
          <Link
            href="/history"
            className="flex items-center gap-3 px-6 py-4 bg-[#F6F6F6] rounded-xl hover:bg-[#ECECEC] transition-colors"
          >
            <AiOutlineHistory className="w-6 h-6 text-[#555555]" />
            <span className="font-medium text-[#111111]">History</span>
          </Link>
          <Link
            href="/liked"
            className="flex items-center gap-3 px-6 py-4 bg-[#F6F6F6] rounded-xl hover:bg-[#ECECEC] transition-colors"
          >
            <AiOutlineLike className="w-6 h-6 text-[#555555]" />
            <span className="font-medium text-[#111111]">Liked Videos</span>
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-3 px-6 py-4 bg-[#F6F6F6] rounded-xl hover:bg-[#ECECEC] transition-colors"
          >
            <HiOutlineVideoCamera className="w-6 h-6 text-[#555555]" />
            <span className="font-medium text-[#111111]">Your Videos</span>
          </Link>
        </div>
      </div>

      {/* Your Videos */}
      {userVideos.length > 0 && (
        <VideoGrid
          videos={userVideos}
          title="Your Videos"
          currentUserId={userId}
          isChannelOwner={true}
        />
      )}

      {/* Watch History */}
      {historyVideos.length > 0 && (
        <VideoGrid
          videos={historyVideos}
          title="Recent History"
          currentUserId={userId}
        />
      )}

      {/* Liked Videos */}
      {likedVideos.length > 0 && (
        <VideoGrid
          videos={likedVideos}
          title="Liked Videos"
          currentUserId={userId}
        />
      )}

      {/* Empty State */}
      {userVideos.length === 0 && historyVideos.length === 0 && likedVideos.length === 0 && (
        <div className="bg-white rounded-[20px] p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F6F6F6] flex items-center justify-center">
            <HiOutlineVideoCamera className="w-10 h-10 text-[#999999]" />
          </div>
          <h3 className="text-lg font-medium text-[#111111] mb-2">Your library is empty</h3>
          <p className="text-sm text-[#555555] mb-6">
            Start watching, liking, and uploading videos to build your library.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-[#66E3D3] text-white font-medium rounded-full hover:bg-[#5BD26D] transition-colors"
          >
            Browse Videos
          </Link>
        </div>
      )}
    </div>
  );
}
