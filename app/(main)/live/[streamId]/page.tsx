'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LivePlayer from '@/components/live/LivePlayer';
import LiveChat from '@/components/live/LiveChat';
import { formatViews, formatTimeAgo } from '@/lib/utils';
import { GoVerified } from 'react-icons/go';
import { getPusherClient, PUSHER_EVENTS, getStreamChannelName } from '@/lib/pusher';

interface Stream {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  playbackUrl: string;
  isLive: boolean;
  ended: boolean;
  viewers: number;
  category: string;
  createdAt: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    subscribers: number;
  };
}

export default function LiveWatchPage({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const { streamId } = use(params);
  const { data: session } = useSession();
  const [stream, setStream] = useState<Stream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const currentUserId = (session?.user as { id?: string })?.id;

  // Fetch stream data
  useEffect(() => {
    const fetchStream = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/live/${streamId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Stream not found');
        }
        const data = await res.json();
        setStream(data.stream);
        setViewers(data.stream.viewers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stream');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStream();
  }, [streamId]);

  // Track viewer join/leave
  useEffect(() => {
    if (!stream || !stream.isLive || stream.ended) return;

    // Join as viewer
    const joinViewer = async () => {
      try {
        await fetch(`/api/live/${streamId}/viewers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join' }),
        });
      } catch (error) {
        console.error('Failed to join:', error);
      }
    };

    joinViewer();

    // Leave when unmounting
    return () => {
      fetch(`/api/live/${streamId}/viewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      }).catch(console.error);
    };
  }, [streamId, stream?.isLive, stream?.ended]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(getStreamChannelName(streamId));

    channel.bind(PUSHER_EVENTS.VIEWER_COUNT, (data: { count: number }) => {
      setViewers(data.count);
    });

    channel.bind(PUSHER_EVENTS.STREAM_END, () => {
      setStream((prev) => (prev ? { ...prev, isLive: false, ended: true } : null));
    });

    channel.bind(PUSHER_EVENTS.STREAM_START, () => {
      setStream((prev) => (prev ? { ...prev, isLive: true } : null));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getStreamChannelName(streamId));
    };
  }, [streamId]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUserId || !stream?.creatorId._id) return;

      try {
        const res = await fetch(`/api/users/${currentUserId}/subscriptions`);
        if (res.ok) {
          const data = await res.json();
          const isSubbed = data.subscriptions?.some(
            (sub: { _id: string }) => sub._id === stream.creatorId._id
          );
          setIsSubscribed(isSubbed);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    };

    checkSubscription();
  }, [currentUserId, stream?.creatorId._id]);

  const handleSubscribe = async () => {
    if (!currentUserId || !stream?.creatorId._id) return;

    try {
      const endpoint = isSubscribed ? 'unsubscribe' : 'subscribe';
      const res = await fetch(`/api/users/${stream.creatorId._id}/${endpoint}`, {
        method: 'POST',
      });

      if (res.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-[#E5E5E5] border-t-[#FF0000] rounded-full" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#909090]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#0F0F0F] mb-2">
          {error || 'Stream not found'}
        </h2>
        <Link href="/" className="text-[#065FD4] hover:text-[#0056B3]">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Player */}
            <LivePlayer
              playbackUrl={stream.playbackUrl}
              isLive={stream.isLive}
              ended={stream.ended}
              title={stream.title}
              thumbnailUrl={stream.thumbnailUrl}
            />

            {/* Stream Info */}
            <div className="mt-4">
              <h1 className="text-xl font-semibold text-[#0F0F0F] leading-tight">
                {stream.title}
              </h1>

              {/* Stats & Category */}
              <div className="flex items-center gap-2 mt-2 text-sm text-[#606060]">
                {stream.isLive && (
                  <>
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      {formatViews(viewers)} watching now
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{stream.category}</span>
                <span>•</span>
                <span>Started {formatTimeAgo(stream.createdAt)}</span>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between mt-4 pb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-3">
                  <Link href={`/channel/${stream.creatorId._id}`}>
                    {stream.creatorId.avatar ? (
                      <img
                        src={stream.creatorId.avatar}
                        alt={stream.creatorId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#EF6C00] flex items-center justify-center text-white font-medium">
                        {stream.creatorId.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      href={`/channel/${stream.creatorId._id}`}
                      className="flex items-center gap-1 font-medium text-[#0F0F0F] hover:text-[#606060]"
                    >
                      {stream.creatorId.name}
                      {stream.creatorId.verified && (
                        <GoVerified className="w-4 h-4 text-[#606060]" />
                      )}
                    </Link>
                    <p className="text-sm text-[#606060]">
                      {formatViews(stream.creatorId.subscribers)} subscribers
                    </p>
                  </div>
                </div>

                {currentUserId !== stream.creatorId._id && (
                  <button
                    onClick={handleSubscribe}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      isSubscribed
                        ? 'bg-[#F2F2F2] text-[#0F0F0F] hover:bg-[#E5E5E5]'
                        : 'bg-[#0F0F0F] text-white hover:bg-[#272727]'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              {/* Description */}
              {stream.description && (
                <div className="mt-4 p-4 bg-[#F9F9F9] rounded-xl">
                  <p
                    className={`text-sm text-[#0F0F0F] whitespace-pre-wrap ${
                      !showFullDescription && stream.description.length > 200
                        ? 'line-clamp-3'
                        : ''
                    }`}
                  >
                    {stream.description}
                  </p>
                  {stream.description.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-sm font-medium text-[#0F0F0F] hover:text-[#606060]"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full lg:w-[400px] h-[600px] lg:h-[calc(100vh-120px)] sticky top-[80px]">
            <LiveChat streamId={streamId} isLive={stream.isLive} />
          </div>
        </div>
      </div>
    </div>
  );
}

