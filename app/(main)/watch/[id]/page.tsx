import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { PopulatedUser, formatVideo } from '@/lib/types';
import VideoPlayer from './VideoPlayer';
import VideoInfo from './VideoInfo';
import CommentSection from './CommentSection';
import RelatedVideos from './RelatedVideos';

interface Props {
  params: Promise<{ id: string }>;
}

async function getVideoData(id: string) {
  await connectDB();

  const video = await Video.findById(id)
    .populate('userId', 'name avatar subscribers')
    .lean();

  if (!video) return null;

  const [comments, likeCount, dislikeCount, relatedVideos] = await Promise.all([
    Comment.find({ videoId: id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Like.countDocuments({ videoId: id, $or: [{ type: 'like' }, { type: { $exists: false } }] }),
    Like.countDocuments({ videoId: id, type: 'dislike' }),
    Video.find({ _id: { $ne: id }, category: video.category })
      .populate('userId', 'name avatar')
      .sort({ views: -1 })
      .limit(10)
      .lean(),
  ]);

  const currentUser = await getCurrentUser();
  let userAction: 'liked' | 'disliked' | null = null;
  let isSubscribed = false;
  
  if (currentUser) {
    const [existingLike, viewerUser] = await Promise.all([
      Like.findOne({
        videoId: id,
        userId: currentUser.userId,
      }),
      User.findById(currentUser.userId).select('subscriptions').lean(),
    ]);
    
    if (existingLike) {
      const likeType = existingLike.type || 'like';
      userAction = likeType === 'like' ? 'liked' : 'disliked';
    }
    
    const creatorId = (video.userId as unknown as PopulatedUser)._id.toString();
    isSubscribed = viewerUser?.subscriptions?.some(
      (subId: { toString: () => string }) => subId.toString() === creatorId
    ) || false;
  }

  const creator = video.userId as unknown as PopulatedUser & { subscribers: number };
  const isOwner = currentUser?.userId === creator._id.toString();

  return {
    video: {
      _id: video._id.toString(),
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      views: video.views,
      category: video.category,
      createdAt: video.createdAt.toISOString(),
      userId: {
        _id: creator._id.toString(),
        name: creator.name,
        avatar: creator.avatar,
        subscribers: creator.subscribers || 0,
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comments: comments.map((c: any) => {
      const commentUser = c.userId as PopulatedUser;
      return {
        _id: c._id.toString(),
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        userId: {
          _id: commentUser._id.toString(),
          name: commentUser.name,
          avatar: commentUser.avatar,
        },
      };
    }),
    likeCount,
    dislikeCount,
    userAction,
    isSubscribed,
    isOwner,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relatedVideos: relatedVideos.map((v: any) => formatVideo(v)),
    currentUserId: currentUser?.userId || null,
  };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const data = await getVideoData(id);

  if (!data) {
    notFound();
  }

  const {
    video,
    comments,
    likeCount,
    dislikeCount,
    userAction,
    isSubscribed,
    isOwner,
    relatedVideos,
    currentUserId,
  } = data;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto px-4 lg:px-6 py-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <VideoPlayer videoUrl={video.videoUrl} videoId={video._id} />

        {/* Video Info */}
        <VideoInfo
          video={video}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          userAction={userAction}
          isSubscribed={isSubscribed}
          isOwner={isOwner}
          currentUserId={currentUserId}
        />

        {/* Comments */}
        <CommentSection
          videoId={video._id}
          comments={comments}
          currentUserId={currentUserId}
        />
      </div>

      {/* Sidebar - Related Videos */}
      <div className="w-full lg:w-[402px] flex-shrink-0">
        <RelatedVideos videos={relatedVideos} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
