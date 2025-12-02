'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import ShortCard from '@/components/shorts/ShortCard';
import { formatViews, formatTimeAgo } from '@/lib/utils';
import { GoVerified } from 'react-icons/go';
import { IoChevronDown } from 'react-icons/io5';
import { HiBell } from 'react-icons/hi2';
import { FiCamera } from 'react-icons/fi';
import { SiYoutubeshorts } from 'react-icons/si';
import LiveCard from '@/components/live/LiveCard';

interface Channel {
  _id: string;
  name: string;
  avatar?: string;
  banner?: string;
  subscribers: number;
  videoCount: number;
  description?: string;
  customUrl?: string;
  verified?: boolean;
  createdAt: string;
}

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  category?: string;
  description?: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface LiveStream {
  _id: string;
  title: string;
  thumbnailUrl: string;
  viewers: number;
  isLive: boolean;
  ended: boolean;
  category: string;
  createdAt: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface Short {
  _id: string;
  title: string;
  thumbnailUrl: string;
  views: number;
  duration: number;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'videos', label: 'Videos' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'live', label: 'Live' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'community', label: 'Community' },
  { id: 'channels', label: 'Channels' },
  { id: 'about', label: 'About' },
];

export default function ChannelPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [sortBy, setSortBy] = useState('latest');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loadingShorts, setLoadingShorts] = useState(false);

  const channelId = params.id as string;
  const currentUserId = (session?.user as { id?: string })?.id || null;
  const isOwnChannel = currentUserId === channelId;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);

        // Fetch user/channel data
        const [userRes, videosRes] = await Promise.all([
          fetch(`/api/users/${channelId}`),
          fetch(`/api/videos/channel/${channelId}`),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (videosRes.ok) {
            const videosData = await videosRes.json();
            setVideos(videosData.videos || []);
            setChannel({
              _id: channelId,
              name: userData.user.name,
              avatar: userData.user.avatar,
              banner: userData.user.banner,
              description: userData.user.description,
              customUrl: userData.user.customUrl,
              verified: userData.user.verified,
              subscribers: userData.user.subscribers || 0,
              videoCount: videosData.videos?.length || 0,
              createdAt: userData.user.createdAt,
            });
          }
        } else {
          // Fallback: try to get info from videos
          if (videosRes.ok) {
            const videosData = await videosRes.json();
            setVideos(videosData.videos || []);

            if (videosData.videos?.length > 0) {
              const firstVideo = videosData.videos[0];
              setChannel({
                _id: channelId,
                name: firstVideo.userId.name,
                avatar: firstVideo.userId.avatar,
                subscribers: 0,
                videoCount: videosData.videos.length,
                verified: firstVideo.userId.verified,
                createdAt: '',
              });
            }
          }
        }

        // Check subscription status
        if (currentUserId && currentUserId !== channelId) {
          const subRes = await fetch(`/api/users/${currentUserId}/subscriptions`);
          if (subRes.ok) {
            const subData = await subRes.json();
            const subs = subData.subscriptions || [];
            setIsSubscribed(subs.some((s: { _id: string }) => s._id === channelId));
          }
        }

        // Fetch live streams
        const liveRes = await fetch(`/api/live?userId=${channelId}`);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          setLiveStreams(liveData.streams || []);
        }

        // Fetch shorts
        const shortsRes = await fetch(`/api/shorts/channel/${channelId}`);
        if (shortsRes.ok) {
          const shortsData = await shortsRes.json();
          setShorts(shortsData.shorts || []);
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId, currentUserId]);

  const handleSubscribe = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    setSubscribing(true);
    try {
      const endpoint = isSubscribed
        ? `/api/users/${channelId}/unsubscribe`
        : `/api/users/${channelId}/subscribe`;

      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setIsSubscribed(!isSubscribed);
        if (channel) {
          setChannel({
            ...channel,
            subscribers: channel.subscribers + (isSubscribed ? -1 : 1),
          });
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDelete = (videoId: string) => {
    setVideos(videos.filter((v) => v._id !== videoId));
  };

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'popular') {
      return b.views - a.views;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-[200px] bg-[#E5E5E5] rounded-xl mb-4" />
        {/* Channel Info Skeleton */}
        <div className="flex gap-6 mb-4 px-6">
          <div className="w-40 h-40 bg-[#E5E5E5] rounded-full -mt-16" />
          <div className="flex-1 pt-4 space-y-3">
            <div className="h-7 bg-[#E5E5E5] rounded w-48" />
            <div className="h-4 bg-[#E5E5E5] rounded w-72" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-medium text-[#0F0F0F]">Channel not found</h2>
        <p className="text-[#606060] mt-2">
          This channel may have been removed or is unavailable.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-[#0F0F0F] text-white rounded-full text-sm font-medium"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-6 -mt-6">
      {/* Banner */}
      <div className="relative h-[200px] overflow-hidden group">
        {channel.banner ? (
          <img
            src={channel.banner}
            alt={`${channel.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#3EA6FF] via-[#0D47A1] to-[#3EA6FF]" />
        )}
        
        {/* Edit Banner Button (for channel owner) */}
        {isOwnChannel && (
          <Link
            href="/studio/customization"
            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <FiCamera className="w-4 h-4" />
            Edit banner
          </Link>
        )}
      </div>

      {/* Channel Header */}
      <div className="px-6 md:px-24 py-4">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 -mt-16 md:-mt-10 relative group">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.name}
                className="w-40 h-40 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 md:w-40 md:h-40 rounded-full bg-[#EF6C00] flex items-center justify-center text-white text-6xl font-medium border-4 border-white shadow-lg">
                {channel.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Edit Avatar Button (for channel owner) */}
            {isOwnChannel && (
              <Link
                href="/studio/customization"
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiCamera className="w-8 h-8 text-white" />
              </Link>
            )}
          </div>

          {/* Channel Info */}
          <div className="flex-1 mt-4 md:mt-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0F0F0F]">{channel.name}</h1>
              {channel.verified && (
                <GoVerified className="w-5 h-5 text-[#606060]" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 text-sm text-[#606060] mt-1">
              {channel.customUrl && (
                <>
                  <span>{channel.customUrl}</span>
                  <span className="mx-1">•</span>
                </>
              )}
              <span>{formatViews(channel.subscribers)} subscribers</span>
              <span className="mx-1">•</span>
              <span>{channel.videoCount} videos</span>
            </div>

            {channel.description && (
              <p className="text-sm text-[#606060] mt-2 line-clamp-1">
                {channel.description}
                <button className="text-[#0F0F0F] font-medium ml-1">more</button>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              {isOwnChannel ? (
                <>
                  <Link
                    href="/studio/customization"
                    className="px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#E5E5E5] transition-colors"
                  >
                    Customize channel
                  </Link>
                  <Link
                    href="/studio/content"
                    className="px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#E5E5E5] transition-colors"
                  >
                    Manage videos
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors disabled:opacity-50 ${
                      isSubscribed
                        ? 'bg-[#F2F2F2] text-[#0F0F0F] hover:bg-[#E5E5E5]'
                        : 'bg-[#0F0F0F] text-white hover:bg-[#272727]'
                    }`}
                  >
                    {subscribing
                      ? 'Loading...'
                      : isSubscribed
                      ? 'Subscribed'
                      : 'Subscribe'}
                  </button>
                  {isSubscribed && (
                    <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                      <HiBell className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E5E5] px-6 md:px-24">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#0F0F0F] border-[#0F0F0F]'
                  : 'text-[#606060] border-transparent hover:text-[#0F0F0F] hover:border-[#909090]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 md:px-24 py-6">
        {activeTab === 'videos' && (
          <div>
            {/* Sort Options */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#606060]">Sort by</span>
                <button
                  onClick={() =>
                    setSortBy(sortBy === 'latest' ? 'popular' : 'latest')
                  }
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F2F2F2] rounded-lg text-sm font-medium hover:bg-[#E5E5E5] transition-colors"
                >
                  {sortBy === 'latest' ? 'Latest' : 'Popular'}
                  <IoChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Videos Grid */}
            {sortedVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {sortedVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    isOwner={isOwnChannel}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
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
                <h3 className="text-xl font-medium text-[#0F0F0F] mb-2">
                  No videos uploaded yet
                </h3>
                <p className="text-[#606060]">
                  {isOwnChannel
                    ? 'Upload your first video to get started!'
                    : 'This channel hasn\'t uploaded any videos yet.'}
                </p>
                {isOwnChannel && (
                  <Link
                    href="/upload"
                    className="inline-block mt-4 px-4 py-2 bg-[#065FD4] text-white rounded-full text-sm font-medium hover:bg-[#065FD4]/90 transition-colors"
                  >
                    Upload video
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'home' && (
          <div>
            {sortedVideos.length > 0 ? (
              <>
                {/* Featured Video */}
                <div className="mb-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <Link
                      href={`/watch/${sortedVideos[0]._id}`}
                      className="lg:w-[640px] flex-shrink-0"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F2F2F2]">
                        <img
                          src={sortedVideos[0].thumbnail}
                          alt={sortedVideos[0].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link href={`/watch/${sortedVideos[0]._id}`}>
                        <h3 className="text-lg font-medium text-[#0F0F0F] line-clamp-2">
                          {sortedVideos[0].title}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#606060] mt-1">
                        {formatViews(sortedVideos[0].views)} views •{' '}
                        {formatTimeAgo(sortedVideos[0].createdAt)}
                      </p>
                      {sortedVideos[0].description && (
                        <p className="text-sm text-[#606060] mt-3 line-clamp-4">
                          {sortedVideos[0].description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Videos */}
                {sortedVideos.length > 1 && (
                  <div>
                    <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">
                      Videos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                      {sortedVideos.slice(1).map((video) => (
                        <VideoCard
                          key={video._id}
                          video={video}
                          isOwner={isOwnChannel}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium text-[#0F0F0F] mb-2">
                  This channel doesn&apos;t have any content
                </h3>
                <p className="text-[#606060]">Check back later for updates.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">
              Description
            </h2>
            <p className="text-sm text-[#606060] whitespace-pre-wrap">
              {channel.description || 'No description provided.'}
            </p>

            <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
              <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">Stats</h2>
              <div className="text-sm text-[#606060]">
                <p>
                  Joined {channel.createdAt ? formatTimeAgo(channel.createdAt) : 'recently'}
                </p>
                <p className="mt-1">{formatViews(channel.videoCount)} videos</p>
                <p className="mt-1">
                  {formatViews(videos.reduce((acc, v) => acc + v.views, 0))} total
                  views
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Tab */}
        {activeTab === 'live' && (
          <div>
            {/* Currently Live */}
            {liveStreams.filter(s => s.isLive && !s.ended).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h2 className="text-lg font-medium text-[#0F0F0F]">Currently Live</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {liveStreams
                    .filter(s => s.isLive && !s.ended)
                    .map(stream => (
                      <LiveCard key={stream._id} stream={stream} />
                    ))}
                </div>
              </div>
            )}

            {/* Past Live Streams */}
            {liveStreams.filter(s => s.ended).length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">Past Live Streams</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {liveStreams
                    .filter(s => s.ended)
                    .map(stream => (
                      <LiveCard key={stream._id} stream={stream} />
                    ))}
                </div>
              </div>
            )}

            {/* No streams */}
            {liveStreams.length === 0 && (
              <div className="text-center py-20">
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
                <h3 className="text-xl font-medium text-[#0F0F0F] mb-2">
                  No live streams yet
                </h3>
                <p className="text-[#606060]">
                  {isOwnChannel
                    ? 'Start your first live stream from the Studio!'
                    : 'This channel hasn\'t gone live yet.'}
                </p>
                {isOwnChannel && (
                  <Link
                    href="/studio/live"
                    className="inline-block mt-4 px-4 py-2 bg-[#FF0000] text-white rounded-full text-sm font-medium hover:bg-[#CC0000] transition-colors"
                  >
                    Go Live
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shorts Tab */}
        {activeTab === 'shorts' && (
          <div>
            {shorts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {shorts.map((short) => (
                  <ShortCard key={short._id} short={short} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                  <SiYoutubeshorts className="w-12 h-12 text-[#909090]" />
                </div>
                <h3 className="text-xl font-medium text-[#0F0F0F] mb-2">
                  No Shorts uploaded yet
                </h3>
                <p className="text-[#606060]">
                  {isOwnChannel
                    ? 'Create your first Short to get started!'
                    : "This channel hasn't uploaded any Shorts yet."}
                </p>
                {isOwnChannel && (
                  <Link
                    href="/upload/short"
                    className="inline-block mt-4 px-4 py-2 bg-[#FF0000] text-white rounded-full text-sm font-medium hover:bg-[#CC0000] transition-colors"
                  >
                    Create Short
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {['playlists', 'community', 'channels'].includes(
          activeTab
        ) && (
          <div className="text-center py-20">
            <p className="text-[#606060]">
              This tab is under construction. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
