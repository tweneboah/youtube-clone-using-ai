import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import VideoGrid from '@/components/VideoGrid';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Video from '@/models/Video';
import { formatVideo } from '@/lib/types';
import Link from 'next/link';
import { MdOutlineSubscriptions } from 'react-icons/md';

export const dynamic = 'force-dynamic';

async function getSubscriptionData(userId: string) {
  await connectDB();

  const user = await User.findById(userId).select('subscriptions').lean();
  const subscriptionCount = user?.subscriptions?.length || 0;

  if (!subscriptionCount) {
    return { videos: [], subscriptionCount: 0 };
  }

  const videos = await Video.find({ userId: { $in: user.subscriptions } })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { videos: videos.map((v: any) => formatVideo(v)), subscriptionCount };
}

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login');
  }

  const { videos, subscriptionCount } = await getSubscriptionData(userId);

  // No subscriptions at all
  if (subscriptionCount === 0) {
    return (
      <div className="bg-white rounded-[20px] p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F6F6F6] flex items-center justify-center">
          <MdOutlineSubscriptions className="w-10 h-10 text-[#999999]" />
        </div>
        <h3 className="text-lg font-medium text-[#111111] mb-2">No subscriptions yet</h3>
        <p className="text-sm text-[#555555] mb-6">
          Subscribe to channels to see their videos here.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 bg-[#66E3D3] text-white font-medium rounded-full hover:bg-[#5BD26D] transition-colors"
        >
          Discover Channels
        </Link>
      </div>
    );
  }

  // Has subscriptions but no videos from those channels
  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-[20px] p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F6F6F6] flex items-center justify-center">
          <MdOutlineSubscriptions className="w-10 h-10 text-[#999999]" />
        </div>
        <h3 className="text-lg font-medium text-[#111111] mb-2">No videos yet</h3>
        <p className="text-sm text-[#555555] mb-6">
          You&apos;re subscribed to {subscriptionCount} channel{subscriptionCount > 1 ? 's' : ''}, but they haven&apos;t uploaded any videos yet.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 bg-[#66E3D3] text-white font-medium rounded-full hover:bg-[#5BD26D] transition-colors"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  return (
    <VideoGrid
      videos={videos}
      title="Subscriptions"
      showViewMore={false}
      currentUserId={userId}
    />
  );
}
