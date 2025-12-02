'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ShortPlayer from './ShortPlayer';
import ShortActions from './ShortActions';
import ShortCommentDrawer from './ShortCommentDrawer';
import Link from 'next/link';
import { formatViews, formatTimeAgo } from '@/lib/utils';
import { GoVerified } from 'react-icons/go';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';

interface Short {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: string[];
  hashtags: string[];
  soundName?: string;
  createdAt: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface ShortFeedProps {
  initialShorts: Short[];
  initialIndex?: number;
}

export default function ShortFeed({ initialShorts, initialIndex = 0 }: ShortFeedProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id || null;
  
  const [shorts, setShorts] = useState<Short[]>(initialShorts);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [likesState, setLikesState] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const currentShort = shorts[currentIndex];

  // Initialize likes state
  useEffect(() => {
    const initialLikes: Record<string, { liked: boolean; count: number }> = {};
    shorts.forEach(short => {
      initialLikes[short._id] = {
        liked: currentUserId ? short.likes.includes(currentUserId) : false,
        count: short.likes.length,
      };
    });
    setLikesState(initialLikes);
  }, [shorts, currentUserId]);

  // Fetch comments count
  useEffect(() => {
    const fetchCommentsCount = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        shorts.map(async (short) => {
          try {
            const res = await fetch(`/api/shorts/${short._id}/comments?limit=1`);
            if (res.ok) {
              const data = await res.json();
              counts[short._id] = data.pagination.total;
            }
          } catch (error) {
            counts[short._id] = 0;
          }
        })
      );
      setCommentsCount(counts);
    };

    fetchCommentsCount();
  }, [shorts]);

  // Track view
  useEffect(() => {
    const trackView = async () => {
      if (currentShort) {
        try {
          await fetch(`/api/shorts/${currentShort._id}/view`, { method: 'POST' });
        } catch (error) {
          console.error('Failed to track view:', error);
        }
      }
    };

    trackView();
  }, [currentShort?._id]);

  // Load more shorts when reaching the end
  const loadMoreShorts = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/shorts?page=${Math.ceil(shorts.length / 10) + 1}&limit=10&sort=random`);
      if (res.ok) {
        const data = await res.json();
        if (data.shorts.length > 0) {
          setShorts(prev => [...prev, ...data.shorts]);
        }
      }
    } catch (error) {
      console.error('Failed to load more shorts:', error);
    } finally {
      setLoading(false);
    }
  }, [shorts.length, loading]);

  // Navigate between shorts
  const goToShort = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Load more when near the end
      if (currentIndex >= shorts.length - 3) {
        loadMoreShorts();
      }
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, shorts.length, loadMoreShorts]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToShort('down');
      } else {
        goToShort('up');
      }
    }
  };

  // Wheel handler for desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isCommentOpen) return;
    
    e.preventDefault();
    if (e.deltaY > 30) {
      goToShort('down');
    } else if (e.deltaY < -30) {
      goToShort('up');
    }
  }, [goToShort, isCommentOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentOpen) return;
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToShort('down');
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToShort('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToShort, isCommentOpen]);

  // Handle like
  const handleLike = async () => {
    if (!currentShort) return;

    try {
      const res = await fetch(`/api/shorts/${currentShort._id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikesState(prev => ({
          ...prev,
          [currentShort._id]: {
            liked: data.liked,
            count: data.likesCount,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  // Handle share
  const handleShare = () => {
    // Could show a toast notification
    console.log('Link copied to clipboard');
  };

  if (!currentShort) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-[#0F0F0F]">
        <p>No shorts available</p>
      </div>
    );
  }

  const currentLikes = likesState[currentShort._id] || { liked: false, count: 0 };
  const currentComments = commentsCount[currentShort._id] || 0;

  return (
    <div 
      ref={containerRef}
      className="relative h-[calc(100vh-56px)] overflow-hidden bg-white flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Short Container */}
      <div className="relative w-full max-w-[420px] h-full flex items-center justify-center">
        {/* Video Container */}
        <div className="relative w-full aspect-[9/16] max-h-full bg-[#0F0F0F] rounded-xl overflow-hidden shadow-lg">
          <ShortPlayer
            videoUrl={currentShort.videoUrl}
            isVisible={true}
          />

          {/* Gradient Overlay for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Short Info */}
          <div className="absolute bottom-4 left-4 right-20 text-white z-10">
            {/* Creator Info */}
            <Link 
              href={`/channel/${currentShort.creatorId._id}`}
              className="flex items-center gap-2 mb-3"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                {currentShort.creatorId.avatar ? (
                  <img
                    src={currentShort.creatorId.avatar}
                    alt={currentShort.creatorId.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#EF6C00] flex items-center justify-center text-white text-sm font-medium">
                    {currentShort.creatorId.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">
                  @{currentShort.creatorId.name.replace(/\s+/g, '').toLowerCase()}
                </span>
                {currentShort.creatorId.verified && (
                  <GoVerified className="w-4 h-4 text-white" />
                )}
              </div>
            </Link>

            {/* Title */}
            <p className="text-sm font-medium line-clamp-2 mb-2">
              {currentShort.title}
            </p>

            {/* Description */}
            {currentShort.description && (
              <p className="text-xs text-white/80 line-clamp-2 mb-2">
                {currentShort.description}
              </p>
            )}

            {/* Hashtags */}
            {currentShort.hashtags && currentShort.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {currentShort.hashtags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs text-[#3EA6FF]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Sound Name */}
            {currentShort.soundName && (
              <div className="flex items-center gap-2 text-xs">
                <span className="animate-spin-slow">🎵</span>
                <span className="truncate">{currentShort.soundName}</span>
              </div>
            )}

            {/* Stats */}
            <p className="text-xs text-white/60 mt-2">
              {formatViews(currentShort.views)} views • {formatTimeAgo(currentShort.createdAt)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 z-10">
            <ShortActions
              shortId={currentShort._id}
              creator={currentShort.creatorId}
              likesCount={currentLikes.count}
              commentsCount={currentComments}
              isLiked={currentLikes.liked}
              onLike={handleLike}
              onCommentClick={() => setIsCommentOpen(true)}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:flex absolute right-[-60px] top-1/2 -translate-y-1/2 flex-col gap-4">
          <button
            onClick={() => goToShort('up')}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full bg-[#F2F2F2] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <IoChevronUp className="w-6 h-6 text-[#0F0F0F]" />
          </button>
          <button
            onClick={() => goToShort('down')}
            disabled={currentIndex >= shorts.length - 1 && !loading}
            className={`w-12 h-12 rounded-full bg-[#F2F2F2] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors ${
              currentIndex >= shorts.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <IoChevronDown className="w-6 h-6 text-[#0F0F0F]" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1">
          {shorts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => {
            const actualIndex = Math.max(0, currentIndex - 2) + idx;
            return (
              <div
                key={actualIndex}
                className={`w-1 h-6 rounded-full transition-all duration-200 ${
                  actualIndex === currentIndex ? 'bg-[#0F0F0F] h-8' : 'bg-[#E5E5E5]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Comment Drawer */}
      <ShortCommentDrawer
        shortId={currentShort._id}
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        onCommentAdded={() => {
          setCommentsCount(prev => ({
            ...prev,
            [currentShort._id]: (prev[currentShort._id] || 0) + 1,
          }));
        }}
      />
    </div>
  );
}

