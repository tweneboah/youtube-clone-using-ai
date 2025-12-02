'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatViews } from '@/lib/utils';
import {
  MdKeyboardArrowDown,
  MdOutlineVisibility,
  MdOutlineAccessTime,
  MdOutlinePeopleAlt,
  MdOutlineAttachMoney,
} from 'react-icons/md';
import { HiOutlineArrowTrendingDown } from 'react-icons/hi2';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  views: number;
  duration: number;
  createdAt: string;
}

interface AnalyticsStats {
  totalViews: number;
  watchTimeHours: number;
  subscribers: number;
  subscriberChange: number;
  estimatedRevenue: number;
  viewsComparison: string;
  watchTimeComparison: string;
  subscribersComparison: string;
}

type TabType = 'overview' | 'content' | 'audience' | 'revenue' | 'trends';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Last 28 days');

  const userId = (session?.user as { id?: string })?.id;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Content' },
    { id: 'audience', label: 'Audience' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'trends', label: 'Trends' },
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
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

          setStats({
            totalViews,
            watchTimeHours: Math.floor(totalViews * 0.04),
            subscribers: 0,
            subscriberChange: 0,
            estimatedRevenue: parseFloat((totalViews * 0.002).toFixed(2)),
            viewsComparison: '1.8K less than usual',
            watchTimeComparison: '83.4 less than usual',
            subscribersComparison: '14 less than usual',
          });

          setTopVideos(videos.sort((a: Video, b: Video) => b.views - a.views).slice(0, 5));
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats((prev) => prev ? {
            ...prev,
            subscribers: profileData.user.subscribers || 0,
            subscriberChange: Math.floor((profileData.user.subscribers || 0) * 0.1),
          } : null);
        }
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  // Generate chart data points
  const generateChartData = () => {
    const points = [];
    for (let i = 0; i < 28; i++) {
      const baseValue = 150;
      const variation = Math.random() * 200;
      points.push(baseValue + variation);
    }
    // Add a spike at the end
    points[points.length - 1] = 400;
    points[points.length - 2] = 380;
    points[points.length - 3] = 350;
    return points;
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#E5E5E5] rounded" />
        <div className="h-12 w-full max-w-md bg-[#E5E5E5] rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#E5E5E5] rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-[#E5E5E5] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[22px] font-normal text-[#0F0F0F]">Channel analytics</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-sm hover:bg-[#F2F2F2] transition-colors">
              Advanced mode
            </button>
            <button className="flex items-center gap-2 text-sm text-[#0F0F0F]">
              <div className="text-right">
                <p className="text-xs text-[#606060]">Oct 30 – Nov 26, 2025</p>
                <p className="font-medium">{dateRange}</p>
              </div>
              <MdKeyboardArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E5E5] mb-6">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0F0F0F] border-[#0F0F0F]'
                    : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Main Headline */}
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 mb-6">
              <h2 className="text-xl font-medium text-[#0F0F0F] text-center mb-6">
                Your channel got {formatViews(stats?.totalViews || 0)} views in the last 28 days
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-0 border border-[#E5E5E5] rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-r border-[#E5E5E5] text-center bg-[#F8F8F8]">
                  <p className="text-xs text-[#606060] mb-1">Views</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-medium text-[#0F0F0F]">
                      {formatViews(stats?.totalViews || 0)}
                    </span>
                    <HiOutlineArrowTrendingDown className="w-4 h-4 text-[#606060]" />
                  </div>
                  <p className="text-xs text-[#606060] mt-1">{stats?.viewsComparison}</p>
                </div>
                <div className="p-4 border-r border-[#E5E5E5] text-center">
                  <p className="text-xs text-[#606060] mb-1">Watch time (hours)</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-medium text-[#0F0F0F]">
                      {stats?.watchTimeHours || 0}
                    </span>
                    <HiOutlineArrowTrendingDown className="w-4 h-4 text-[#606060]" />
                  </div>
                  <p className="text-xs text-[#606060] mt-1">{stats?.watchTimeComparison}</p>
                </div>
                <div className="p-4 border-r border-[#E5E5E5] text-center">
                  <p className="text-xs text-[#606060] mb-1">Subscribers</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-medium text-[#0F0F0F]">
                      +{stats?.subscriberChange || 0}
                    </span>
                    <HiOutlineArrowTrendingDown className="w-4 h-4 text-[#606060]" />
                  </div>
                  <p className="text-xs text-[#606060] mt-1">{stats?.subscribersComparison}</p>
                </div>
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <p className="text-xs text-[#606060]">Estimated revenue</p>
                    <MdOutlineAccessTime className="w-4 h-4 text-[#606060]" />
                  </div>
                  <span className="text-2xl font-medium text-[#0F0F0F]">
                    ${stats?.estimatedRevenue || 0}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-48 mb-4">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 50, 100, 150].map((y, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={200 - (y / 150) * 180}
                      x2="800"
                      y2={200 - (y / 150) * 180}
                      stroke="#E5E5E5"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Area fill */}
                  <path
                    d={`M 0 200 ${chartData.map((val, i) => `L ${(i / (chartData.length - 1)) * 800} ${200 - (val / maxValue) * 180}`).join(' ')} L 800 200 Z`}
                    fill="rgba(96, 165, 250, 0.2)"
                  />
                  {/* Line */}
                  <path
                    d={`M ${chartData.map((val, i) => `${(i / (chartData.length - 1)) * 800} ${200 - (val / maxValue) * 180}`).join(' L ')}`}
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="2"
                  />
                </svg>
                {/* Y-axis labels */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#606060] py-2">
                  <span>450</span>
                  <span>300</span>
                  <span>150</span>
                  <span>0</span>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-xs text-[#606060] px-4">
                <span>Oct 30, 20...</span>
                <span>Nov 4, 2025</span>
                <span>Nov 8, 2025</span>
                <span>Nov 13, 2025</span>
                <span>Nov 17, 2025</span>
                <span>Nov 22, 2025</span>
                <span>Nov 26,...</span>
              </div>

              <button className="mt-4 px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#F2F2F2] transition-colors">
                See more
              </button>
            </div>

            {/* Top Content Table */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-[#0F0F0F] text-center mb-4">
                Your top content in this period
              </h3>
              <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                <div className="grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 bg-[#F9F9F9] text-xs text-[#606060] font-medium border-b border-[#E5E5E5]">
                  <span>Content</span>
                  <span className="text-right">Average view duration</span>
                  <span className="text-right">Views</span>
                </div>
                {topVideos.map((video) => (
                  <Link
                    key={video._id}
                    href={`/watch/${video._id}`}
                    className="grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 items-center hover:bg-[#F9F9F9] border-b border-[#E5E5E5] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-[100px] h-[56px] rounded object-cover"
                      />
                      <span className="text-sm text-[#0F0F0F] line-clamp-2">{video.title}</span>
                    </div>
                    <span className="text-sm text-[#606060] text-right">1:21 (5.0%)</span>
                    <span className="text-sm text-[#0F0F0F] text-right">{video.views}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab !== 'overview' && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
            <p className="text-sm text-[#606060]">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} analytics coming soon
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-[300px] flex-shrink-0 space-y-4">
        {/* Realtime */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-[#0F0F0F]">Realtime</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2196F3] animate-pulse" />
              <span className="text-xs text-[#606060]">Updating live</span>
            </div>
          </div>

          <p className="text-3xl font-medium text-[#0F0F0F] mb-0">
            {formatViews(stats?.subscribers || 0)}
          </p>
          <p className="text-sm text-[#606060] mb-3">Subscribers</p>

          <button className="px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#F2F2F2] transition-colors mb-4">
            See live count
          </button>

          <div className="border-t border-[#E5E5E5] pt-4">
            <p className="text-2xl font-medium text-[#0F0F0F] mb-0">768</p>
            <p className="text-sm text-[#606060] mb-3">Views · Last 48 hours</p>

            {/* Mini bar chart */}
            <div className="flex items-end justify-between h-12 gap-0.5 mb-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#0F0F0F] rounded-t"
                  style={{
                    height: `${Math.random() * 100}%`,
                    opacity: i > 40 ? 0.3 : 1,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-[#606060] text-right">Now</p>
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#0F0F0F]">Top content</h3>
            <span className="text-sm text-[#606060]">Views</span>
          </div>

          <div className="space-y-3">
            {topVideos.slice(0, 3).map((video) => (
              <Link
                key={video._id}
                href={`/watch/${video._id}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0F0F0F] truncate group-hover:text-[#065FD4]">
                    {video.title.substring(0, 20)}...
                  </p>
                </div>
                <span className="text-sm text-[#0F0F0F]">{video.views}</span>
              </Link>
            ))}
          </div>

          <button className="mt-3 px-4 py-2 border border-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#F2F2F2] transition-colors">
            See more
          </button>
        </div>

        {/* Latest Course */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
          <h3 className="text-base font-medium text-[#0F0F0F] mb-3">Latest course</h3>
          <Link href="#" className="flex gap-3 group">
            <div className="w-20 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              MERN BLOG
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#0F0F0F] group-hover:text-[#065FD4]">
                MERN Blog with Subscription using Stripe Payment
              </p>
              <p className="text-xs text-[#606060] mt-1">Updated 1 year ago</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
