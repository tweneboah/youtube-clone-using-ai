'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { formatViews } from '@/lib/utils';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';
import { IoShareSocialOutline, IoEllipsisHorizontal } from 'react-icons/io5';

interface ShortActionsProps {
  shortId: string;
  creator: {
    _id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLike: () => void;
  onCommentClick: () => void;
  onShare: () => void;
}

export default function ShortActions({
  shortId,
  creator,
  likesCount,
  commentsCount,
  isLiked,
  onLike,
  onCommentClick,
  onShare,
}: ShortActionsProps) {
  const { data: session } = useSession();
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    if (liking) return;

    setLiking(true);
    try {
      await onLike();
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this Short',
          url: `${window.location.origin}/shorts/${shortId}`,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/shorts/${shortId}`);
      onShare();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Creator Avatar */}
      <Link href={`/channel/${creator._id}`} className="relative group">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#EF6C00] flex items-center justify-center text-white text-lg font-medium">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* Subscribe indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FF0000] rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">+</span>
        </div>
      </Link>

      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={liking}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
          {isLiked ? (
            <AiFillHeart className="w-7 h-7 text-[#FF0000]" />
          ) : (
            <AiOutlineHeart className="w-7 h-7 text-white" />
          )}
        </div>
        <span className="text-white text-xs font-medium">
          {formatViews(likesCount)}
        </span>
      </button>

      {/* Comment Button */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <BiComment className="w-7 h-7 text-white" />
        </div>
        <span className="text-white text-xs font-medium">
          {formatViews(commentsCount)}
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <IoShareSocialOutline className="w-7 h-7 text-white" />
        </div>
        <span className="text-white text-xs font-medium">Share</span>
      </button>

      {/* More Options */}
      <button className="flex flex-col items-center gap-1 group">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <IoEllipsisHorizontal className="w-7 h-7 text-white" />
        </div>
      </button>
    </div>
  );
}

