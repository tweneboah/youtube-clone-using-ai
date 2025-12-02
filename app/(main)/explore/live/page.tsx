'use client';

import { useState, useEffect } from 'react';
import LiveCard from '@/components/live/LiveCard';

interface Stream {
  _id: string;
  title: string;
  thumbnailUrl: string;
  viewers: number;
  category: string;
  isLive: boolean;
  ended: boolean;
  createdAt: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

export default function ExploreLivePage() {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([]);
  const [recentStreams, setRecentStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        // Fetch all streams
        const res = await fetch('/api/live?limit=50');
        if (res.ok) {
          const data = await res.json();
          const streams = data.streams || [];
          
          // Separate live and recent streams
          setLiveStreams(streams.filter((s: Stream) => s.isLive && !s.ended));
          setRecentStreams(streams.filter((s: Stream) => s.ended));
        }
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F] mb-6">Live</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-[#E5E5E5] rounded-xl" />
                <div className="flex gap-3 mt-3">
                  <div className="w-9 h-9 bg-[#E5E5E5] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#E5E5E5] rounded w-3/4" />
                    <div className="h-3 bg-[#E5E5E5] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#0F0F0F]">Live</h1>

      {/* Live Now Section */}
      {liveStreams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-semibold text-[#0F0F0F]">Live Now</h2>
            <span className="text-sm text-[#606060]">
              {liveStreams.length} stream{liveStreams.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveStreams.map((stream) => (
              <LiveCard key={stream._id} stream={stream} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Streams Section */}
      {recentStreams.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#0F0F0F] mb-4">Recent Streams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentStreams.map((stream) => (
              <LiveCard key={stream._id} stream={stream} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {liveStreams.length === 0 && recentStreams.length === 0 && (
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
            No live streams right now
          </h3>
          <p className="text-[#606060]">
            Check back later to see who&apos;s streaming
          </p>
        </div>
      )}
    </div>
  );
}

