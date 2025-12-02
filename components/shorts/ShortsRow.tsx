'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ShortCard from './ShortCard';
import { SiYoutubeshorts } from 'react-icons/si';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

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

export default function ShortsRow() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await fetch('/api/shorts?limit=12&sort=random');
        if (res.ok) {
          const data = await res.json();
          setShorts(data.shorts || []);
        }
      } catch (error) {
        console.error('Failed to fetch shorts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, []);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [shorts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SiYoutubeshorts className="w-6 h-6 text-[#FF0000]" />
          <h2 className="text-lg font-semibold text-[#0F0F0F]">Shorts</h2>
        </div>
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex-shrink-0">
              <div className="w-[165px] h-[294px] bg-[#E5E5E5] rounded-xl" />
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-[#E5E5E5] rounded w-full" />
                <div className="h-3 bg-[#E5E5E5] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/shorts" className="flex items-center gap-2 group">
          <SiYoutubeshorts className="w-6 h-6 text-[#FF0000]" />
          <h2 className="text-lg font-semibold text-[#0F0F0F] group-hover:text-[#606060] transition-colors">
            Shorts
          </h2>
        </Link>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <IoChevronBack className="w-5 h-5 text-[#0F0F0F]" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <IoChevronForward className="w-5 h-5 text-[#0F0F0F]" />
          </button>
        </div>
      </div>

      {/* Shorts Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScrollability}
        >
          {shorts.map((short) => (
            <ShortCard key={short._id} short={short} showCreator />
          ))}
        </div>

        {/* Gradient Edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}

