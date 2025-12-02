'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatViews, formatTimeAgo } from '@/lib/utils';
import {
  MdOutlineBarChart,
  MdOutlineComment,
  MdOutlineThumbUp,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdOutlineFileUpload,
  MdOutlineCast,
  MdOutlineEdit,
  MdArrowUpward,
  MdCheckCircle,
  MdAccessTime,
  MdRemove,
} from 'react-icons/md';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  views: number;
  createdAt: string;
  duration: number;
}

interface Subscriber {
  _id: string;
  name: string;
  avatar: string;
  subscribers: number;
}

interface DashboardStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  recentViews: number;
  recentSubscribers: number;
  watchTimeHours: number;
  estimatedRevenue: number;
}

export default function StudioDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestVideo, setLatestVideo] = useState<Video | null>(null);
  const [publishedVideos, setPublishedVideos] = useState<Video[]>([]);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatorInsiderIndex, setCreatorInsiderIndex] = useState(0);
  const [showLatestVideoDetails, setShowLatestVideoDetails] = useState(true);

  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        const [videosRes, profileRes] = await Promise.all([
          fetch(`/api/videos/channel/${userId}`),
          fetch('/api/users/profile'),
        ]);

        if (videosRes.ok) {
          const data = await videosRes.json();
          const videos = data.videos || [];

          const totalViews = videos.reduce((acc: number, v: Video) => acc + v.views, 0);
          const totalVideos = videos.length;

          if (videos.length > 0) {
            setLatestVideo(videos[0]);
          }
          setPublishedVideos(videos.slice(0, 5));
          setTopVideos(videos.sort((a: Video, b: Video) => b.views - a.views).slice(0, 3));

          setStats((prev) => ({
            ...prev!,
            totalViews,
            totalVideos,
            recentViews: Math.floor(totalViews * 0.3),
            watchTimeHours: Math.floor(totalViews * 0.04),
            estimatedRevenue: parseFloat((totalViews * 0.002).toFixed(2)),
          }));
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats((prev) => ({
            totalViews: prev?.totalViews || 0,
            totalVideos: prev?.totalVideos || 0,
            recentViews: prev?.recentViews || 0,
            watchTimeHours: prev?.watchTimeHours || 0,
            estimatedRevenue: prev?.estimatedRevenue || 0,
            totalSubscribers: profileData.user.subscribers || 0,
            recentSubscribers: Math.floor((profileData.user.subscribers || 0) * 0.1),
          }));
        }

        // Fetch recent subscribers (mock data for now)
        setRecentSubscribers([
          { _id: '1', name: 'Rhruta12', avatar: '', subscribers: 426 },
          { _id: '2', name: 'Yahia Ali', avatar: '', subscribers: 119 },
        ]);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const creatorInsiderItems = [
    {
      title: 'This Week at YouTube',
      description: 'New features: Better Shopping timestamps, more creator controls, and expanded AI suggestions for comment replies are rolling out',
      image: '/api/placeholder/320/180',
    },
    {
      title: 'Creator Academy',
      description: 'Learn how to grow your channel with our free courses and tutorials',
      image: '/api/placeholder/320/180',
    },
  ];

  const whatsNewItems = [
    'Increasing Shorts length',
    'Expansion of channel permissions',
    'Upcoming changes to Community Guidelines warnings',
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#E5E5E5] rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-[#E5E5E5] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-normal text-[#0F0F0F]">Channel dashboard</h1>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdOutlineFileUpload className="w-6 h-6 text-[#606060]" />
          </button>
          <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdOutlineCast className="w-6 h-6 text-[#606060]" />
          </button>
          <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdOutlineEdit className="w-6 h-6 text-[#606060]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Latest Video Performance */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            <div className="p-4">
              <h2 className="text-base font-medium text-[#0F0F0F] mb-3">Latest video performance</h2>
              
              {latestVideo ? (
                <>
                  <Link href={`/watch/${latestVideo._id}`} className="block">
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <img
                        src={latestVideo.thumbnail}
                        alt={latestVideo.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {latestVideo.title}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between py-2 border-b border-[#E5E5E5]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-[#606060]">
                        <MdOutlineBarChart className="w-5 h-5" />
                        <span>{latestVideo.views}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#606060]">
                        <MdOutlineComment className="w-5 h-5" />
                        <span>1</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#606060]">
                        <MdOutlineThumbUp className="w-5 h-5" />
                        <span>13</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowLatestVideoDetails(!showLatestVideoDetails)}
                      className="p-1 hover:bg-[#F2F2F2] rounded-full"
                    >
                      {showLatestVideoDetails ? (
                        <MdKeyboardArrowUp className="w-6 h-6 text-[#606060]" />
                      ) : (
                        <MdKeyboardArrowDown className="w-6 h-6 text-[#606060]" />
                      )}
                    </button>
                  </div>

                  {showLatestVideoDetails && (
                    <>
                      <p className="text-xs text-[#606060] py-2">First 1 day 21 hours</p>

                      {/* Ranking Stats */}
                      <div className="space-y-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0F0F0F]">Ranking by views</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-[#0F0F0F]">1 of 10</span>
                            <MdKeyboardArrowRight className="w-5 h-5 text-[#606060]" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0F0F0F]">Views</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#0F0F0F]">{latestVideo.views}</span>
                            <MdArrowUpward className="w-4 h-4 text-[#2E7D32]" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0F0F0F]">Impressions click-through rate</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#0F0F0F]">3.0%</span>
                            <MdCheckCircle className="w-4 h-4 text-[#2E7D32]" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0F0F0F]">Average view duration</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#0F0F0F]">1:11</span>
                            <MdAccessTime className="w-4 h-4 text-[#606060]" />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <Link
                          href={`/studio/analytics`}
                          className="px-4 py-2 bg-[#0F0F0F] text-white text-sm font-medium rounded-full hover:bg-[#272727] transition-colors"
                        >
                          Go to video analytics
                        </Link>
                        <Link
                          href={`/watch/${latestVideo._id}`}
                          className="px-4 py-2 bg-[#0F0F0F] text-white text-sm font-medium rounded-full hover:bg-[#272727] transition-colors"
                        >
                          See comments (1)
                        </Link>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#606060]">No videos yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Published Videos */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <h2 className="text-base font-medium text-[#0F0F0F] mb-3">Published videos</h2>
            <div className="space-y-3">
              {publishedVideos.map((video) => (
                <Link
                  key={video._id}
                  href={`/watch/${video._id}`}
                  className="flex gap-3 group"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-[120px] h-[68px] rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F0F0F] line-clamp-2 group-hover:text-[#065FD4]">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#606060]">
                      <span className="flex items-center gap-1">
                        <MdOutlineBarChart className="w-4 h-4" />
                        {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdOutlineComment className="w-4 h-4" />
                        8
                      </span>
                      <span className="flex items-center gap-1">
                        <MdOutlineThumbUp className="w-4 h-4" />
                        11
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          {/* Channel Analytics */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <h2 className="text-base font-medium text-[#0F0F0F] mb-2">Channel analytics</h2>
            <p className="text-xs text-[#606060] mb-1">Current subscribers</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[42px] font-normal text-[#0F0F0F]">
                {formatViews(stats?.totalSubscribers || 0)}
              </span>
            </div>
            <p className="text-sm text-[#2E7D32] mb-4">
              +{stats?.recentSubscribers || 0} in last 28 days
            </p>

            <div className="border-t border-[#E5E5E5] pt-4">
              <h3 className="text-sm font-medium text-[#0F0F0F]">Summary</h3>
              <p className="text-xs text-[#606060] mb-3">Last 28 days</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0F0F0F]">Views</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0F0F0F]">{formatViews(stats?.recentViews || 0)}</span>
                    <HiOutlineArrowTrendingDown className="w-4 h-4 text-[#606060]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0F0F0F]">Watch time (hours)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0F0F0F]">{stats?.watchTimeHours || 0}</span>
                    <HiOutlineArrowTrendingDown className="w-4 h-4 text-[#606060]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0F0F0F]">Estimated revenue</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0F0F0F]">${stats?.estimatedRevenue || 0}</span>
                    <MdRemove className="w-4 h-4 text-[#606060]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E5E5E5] pt-4 mt-4">
              <h3 className="text-sm font-medium text-[#0F0F0F]">Top videos</h3>
              <p className="text-xs text-[#606060] mb-3">Last 48 hours · Views</p>

              <div className="space-y-2">
                {topVideos.map((video) => (
                  <div key={video._id} className="flex items-center justify-between">
                    <span className="text-sm text-[#0F0F0F] truncate flex-1 mr-4">{video.title}</span>
                    <span className="text-sm text-[#0F0F0F]">{video.views}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/studio/analytics"
                className="inline-block mt-4 px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#F2F2F2] transition-colors"
              >
                Go to channel analytics
              </Link>
            </div>
          </div>

          {/* Recent Subscribers */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <h2 className="text-base font-medium text-[#0F0F0F] mb-1">Recent subscribers</h2>
            <p className="text-xs text-[#606060] mb-3">Last 90 days</p>

            <div className="space-y-3">
              {recentSubscribers.map((sub) => (
                <div key={sub._id} className="flex items-center gap-3">
                  {sub.avatar ? (
                    <img
                      src={sub.avatar}
                      alt={sub.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#0F0F0F]">{sub.name}</p>
                    <p className="text-xs text-[#606060]">{sub.subscribers} subscribers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Creator Insider */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-[#0F0F0F]">Creator Insider</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCreatorInsiderIndex(Math.max(0, creatorInsiderIndex - 1))}
                  disabled={creatorInsiderIndex === 0}
                  className="p-1 hover:bg-[#F2F2F2] rounded-full disabled:opacity-50"
                >
                  <MdKeyboardArrowLeft className="w-5 h-5 text-[#606060]" />
                </button>
                <span className="text-xs text-[#606060]">
                  {creatorInsiderIndex + 1} / {creatorInsiderItems.length}
                </span>
                <button
                  onClick={() => setCreatorInsiderIndex(Math.min(creatorInsiderItems.length - 1, creatorInsiderIndex + 1))}
                  disabled={creatorInsiderIndex === creatorInsiderItems.length - 1}
                  className="p-1 hover:bg-[#F2F2F2] rounded-full disabled:opacity-50"
                >
                  <MdKeyboardArrowRight className="w-5 h-5 text-[#606060]" />
                </button>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden mb-3 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-lg font-bold">YOUTUBE NEWS</p>
                <p className="text-sm">BE NEWS FLASH</p>
              </div>
            </div>

            <h3 className="text-sm font-medium text-[#0F0F0F] mb-1">
              {creatorInsiderItems[creatorInsiderIndex].title}
            </h3>
            <p className="text-xs text-[#606060] mb-3">
              {creatorInsiderItems[creatorInsiderIndex].description}
            </p>

            <button className="px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#F2F2F2] transition-colors">
              Watch on YouTube
            </button>
          </div>

          {/* What's New in Studio */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <h2 className="text-base font-medium text-[#0F0F0F] mb-3">What&apos;s new in Studio</h2>

            <div className="space-y-3">
              {whatsNewItems.map((item, index) => (
                <div
                  key={index}
                  className="py-2 border-b border-[#E5E5E5] last:border-0"
                >
                  <p className="text-sm text-[#0F0F0F] hover:text-[#065FD4] cursor-pointer">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
