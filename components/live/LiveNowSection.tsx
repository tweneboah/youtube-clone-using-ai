'use client';

import { useState, useEffect } from 'react';
import LiveCard from './LiveCard';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface Stream {
  _id: string;
  title: string;
  thumbnailUrl: string;
  viewers: number;
  category: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

export default function LiveNowSection() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const res = await fetch('/api/live?liveOnly=true&limit=10');
        if (res.ok) {
          const data = await res.json();
          setStreams(data.streams || []);
        }
      } catch (error) {
        console.error('Failed to fetch live streams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveStreams();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold text-[#0F0F0F]">Live Now</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      </section>
    );
  }

  if (streams.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < (streams.length - 4) * 100;

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('live-streams-container');
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(scrollPosition + scrollAmount);
    }
  };

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold text-[#0F0F0F]">Live Now</h2>
          <span className="text-sm text-[#606060]">
            {streams.length} stream{streams.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {streams.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2 rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2 rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Streams Grid/Carousel */}
      <div className="relative">
        <div
          id="live-streams-container"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-hidden"
        >
          {streams.map((stream) => (
            <LiveCard key={stream._id} stream={stream} />
          ))}
        </div>
      </div>
    </section>
  );
}

