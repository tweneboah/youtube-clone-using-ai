'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatViews, formatTimeAgo } from '@/lib/utils';
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineDislike,
  AiFillDislike,
} from 'react-icons/ai';
import {
  RiShareForwardLine,
  RiDownloadLine,
  RiScissorsCutLine,
} from 'react-icons/ri';
import { BsThreeDots } from 'react-icons/bs';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { HiBell, HiOutlineBell } from 'react-icons/hi2';
import { GoVerified } from 'react-icons/go';

interface VideoInfoProps {
  video: {
    _id: string;
    title: string;
    description?: string;
    views: number;
    category?: string;
    createdAt: string;
    userId: {
      _id: string;
      name: string;
      avatar?: string;
      subscribers: number;
    };
  };
  likeCount: number;
  dislikeCount: number;
  userAction: 'liked' | 'disliked' | null;
  isSubscribed: boolean;
  isOwner: boolean;
  currentUserId: string | null;
}

export default function VideoInfo({
  video,
  likeCount: initialLikeCount,
  dislikeCount: initialDislikeCount,
  userAction: initialUserAction,
  isSubscribed: initialIsSubscribed,
  isOwner,
  currentUserId,
}: VideoInfoProps) {
  const router = useRouter();
  const [userAction, setUserAction] = useState(initialUserAction);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const handleLikeAction = async (type: 'like' | 'dislike') => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${video._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserAction(data.userAction);
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
      }
    } catch (error) {
      console.error('Like/dislike error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setSubscribing(true);
    try {
      const endpoint = isSubscribed
        ? `/api/users/${video.userId._id}/unsubscribe`
        : `/api/users/${video.userId._id}/subscribe`;

      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-3">
      {/* Video Title */}
      <h1 className="text-xl font-semibold text-[#0F0F0F] leading-7">
        {video.title}
      </h1>

      {/* Channel Info & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
        {/* Left: Channel Info */}
        <div className="flex items-center gap-3">
          {/* Channel Avatar */}
          <Link href={`/channel/${video.userId._id}`}>
            {video.userId.avatar ? (
              <img
                src={video.userId.avatar}
                alt={video.userId.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#EF6C00] flex items-center justify-center text-white font-medium">
                {video.userId.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          {/* Channel Name & Subscribers */}
          <div className="min-w-0">
            <Link
              href={`/channel/${video.userId._id}`}
              className="flex items-center gap-1"
            >
              <span className="font-medium text-[#0F0F0F] hover:text-[#0F0F0F]/80">
                {video.userId.name}
              </span>
              <GoVerified className="w-4 h-4 text-[#606060]" />
            </Link>
            <p className="text-xs text-[#606060]">
              {formatViews(video.userId.subscribers)} subscribers
            </p>
          </div>

          {/* Subscribe Button */}
          {!isOwner && (
            <div className="flex items-center ml-2">
              {isSubscribed ? (
                <div className="flex items-center">
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-l-full hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
                  >
                    <HiBell className="w-5 h-5" />
                    Subscribed
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                      className="flex items-center justify-center w-9 h-9 bg-[#F2F2F2] rounded-r-full hover:bg-[#E5E5E5] transition-colors border-l border-[#D9D9D9]"
                    >
                      <IoChevronDown className="w-4 h-4" />
                    </button>
                    {showNotificationMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowNotificationMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-20">
                          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F2F2F2] text-sm">
                            <HiBell className="w-5 h-5" />
                            All
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F2F2F2] text-sm">
                            <HiOutlineBell className="w-5 h-5" />
                            Personalized
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F2F2F2] text-sm">
                            <HiOutlineBell className="w-5 h-5" />
                            None
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="px-4 py-2 bg-[#0F0F0F] text-white text-sm font-medium rounded-full hover:bg-[#272727] transition-colors disabled:opacity-50"
                >
                  {subscribing ? 'Loading...' : 'Subscribe'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like/Dislike */}
          <div className="flex items-center bg-[#F2F2F2] rounded-full">
            <button
              onClick={() => handleLikeAction('like')}
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-l-full transition-colors hover:bg-[#E5E5E5] ${
                userAction === 'liked' ? 'text-[#0F0F0F]' : 'text-[#0F0F0F]'
              } disabled:cursor-wait`}
            >
              {userAction === 'liked' ? (
                <AiFillLike className="w-5 h-5" />
              ) : (
                <AiOutlineLike className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{formatViews(likeCount)}</span>
            </button>
            <div className="w-px h-6 bg-[#D9D9D9]" />
            <button
              onClick={() => handleLikeAction('dislike')}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-r-full transition-colors hover:bg-[#E5E5E5] ${
                userAction === 'disliked' ? 'text-[#0F0F0F]' : 'text-[#0F0F0F]'
              } disabled:cursor-wait`}
            >
              {userAction === 'disliked' ? (
                <AiFillDislike className="w-5 h-5" />
              ) : (
                <AiOutlineDislike className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#E5E5E5] transition-colors"
          >
            <RiShareForwardLine className="w-5 h-5" />
            Share
          </button>

          {/* Download */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#E5E5E5] transition-colors">
            <RiDownloadLine className="w-5 h-5" />
            Download
          </button>

          {/* Clip */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F2F2F2] text-[#0F0F0F] text-sm font-medium rounded-full hover:bg-[#E5E5E5] transition-colors">
            <RiScissorsCutLine className="w-5 h-5" />
            Clip
          </button>

          {/* More */}
          <button className="flex items-center justify-center w-9 h-9 bg-[#F2F2F2] rounded-full hover:bg-[#E5E5E5] transition-colors">
            <BsThreeDots className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description Box */}
      <div
        className={`mt-4 p-3 bg-[#F2F2F2] rounded-xl cursor-pointer hover:bg-[#E5E5E5] transition-colors ${
          expanded ? 'cursor-default hover:bg-[#F2F2F2]' : ''
        }`}
        onClick={() => !expanded && setExpanded(true)}
      >
        {/* Views and Date */}
        <div className="flex items-center gap-2 text-sm font-medium text-[#0F0F0F]">
          <span>{formatViews(video.views)} views</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
          {video.category && (
            <>
              <span>•</span>
              <span className="text-[#065FD4]">#{video.category}</span>
            </>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="mt-2">
            <p
              className={`text-sm text-[#0F0F0F] whitespace-pre-wrap ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {video.description}
            </p>
          </div>
        )}

        {/* Show more/less button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="mt-2 text-sm font-medium text-[#0F0F0F] hover:text-[#0F0F0F]/80"
        >
          {expanded ? (
            <span className="flex items-center gap-1">
              Show less <IoChevronUp className="w-4 h-4" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              ...more
            </span>
          )}
        </button>
      </div>
    </div>
  );
}



