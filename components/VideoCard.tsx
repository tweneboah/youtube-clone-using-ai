'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatViews, formatDuration, formatTimeAgo } from '@/lib/utils';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdOutlineWatchLater, MdOutlinePlaylistAdd } from 'react-icons/md';
import { RiShareForwardLine } from 'react-icons/ri';
import { GoVerified } from 'react-icons/go';

interface VideoCardProps {
  video: {
    _id: string;
    title: string;
    thumbnail: string;
    duration: number;
    views: number;
    createdAt: string | Date;
    category?: string;
    description?: string;
    userId: {
      _id: string;
      name: string;
      avatar?: string;
      verified?: boolean;
    };
  };
  isOwner?: boolean;
  onDelete?: (videoId: string) => void;
  onEdit?: (video: VideoCardProps['video']) => void;
  variant?: 'grid' | 'list';
}

export default function VideoCard({
  video,
  isOwner,
  onDelete,
  onEdit,
  variant = 'grid',
}: VideoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHoverMenu, setShowHoverMenu] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/videos/${video._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (onDelete) {
          onDelete(video._id);
        }
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    if (onEdit) {
      onEdit(video);
    } else {
      router.push(`/watch/${video._id}`);
    }
  };

  if (variant === 'list') {
    return (
      <div className="group flex gap-4">
        <Link href={`/watch/${video._id}`} className="relative flex-shrink-0 w-[360px] aspect-video">
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#F2F2F2]">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
        </Link>
        <div className="flex-1 min-w-0 pt-1">
          <Link href={`/watch/${video._id}`}>
            <h3 className="text-lg font-medium text-[#0F0F0F] line-clamp-2 mb-1">
              {video.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs text-[#606060]">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
          <Link
            href={`/channel/${video.userId._id}`}
            className="flex items-center gap-2 mt-3"
          >
            {video.userId.avatar ? (
              <img
                src={video.userId.avatar}
                alt={video.userId.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-[10px] font-medium">
                {video.userId.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-[#606060] hover:text-[#0F0F0F]">
              {video.userId.name}
            </span>
          </Link>
          {video.description && (
            <p className="text-xs text-[#606060] mt-2 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowHoverMenu(true)}
      onMouseLeave={() => {
        setShowHoverMenu(false);
        if (!showMenu) setShowMenu(false);
      }}
    >
      {/* Thumbnail */}
      <Link href={`/watch/${video._id}`} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F2F2F2]">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:rounded-none transition-all duration-300"
          />
          {/* Duration Badge */}
          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
            {formatDuration(video.duration)}
          </span>
          {/* Hover Actions */}
          {showHoverMenu && (
            <div className="absolute bottom-1 right-10 flex gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1.5 bg-black/80 rounded text-white hover:bg-black transition-colors"
                title="Watch later"
              >
                <MdOutlineWatchLater className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1.5 bg-black/80 rounded text-white hover:bg-black transition-colors"
                title="Add to queue"
              >
                <MdOutlinePlaylistAdd className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex gap-3 mt-3">
        {/* Channel Avatar */}
        <Link
          href={`/channel/${video.userId._id}`}
          className="flex-shrink-0"
        >
          {video.userId.avatar ? (
            <img
              src={video.userId.avatar}
              alt={video.userId.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-sm font-medium">
              {video.userId.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Video Details */}
        <div className="flex-1 min-w-0 pr-6">
          <Link href={`/watch/${video._id}`}>
            <h3 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 leading-5 mb-1 hover:text-[#065FD4]">
              {video.title}
            </h3>
          </Link>
          <Link
            href={`/channel/${video.userId._id}`}
            className="flex items-center gap-1 text-xs text-[#606060] hover:text-[#0F0F0F] transition-colors"
          >
            <span>{video.userId.name}</span>
            {video.userId.verified && (
              <GoVerified className="w-3.5 h-3.5 text-[#606060]" />
            )}
          </Link>
          <p className="text-xs text-[#606060] mt-0.5">
            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute right-0 top-[calc(100%-52px)]">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`p-2 rounded-full hover:bg-[#E5E5E5] transition-all ${
            showHoverMenu || showMenu ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <BsThreeDotsVertical className="w-4 h-4 text-[#606060]" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <MdOutlinePlaylistAdd className="w-5 h-5" />
                Save to playlist
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <MdOutlineWatchLater className="w-5 h-5" />
                Save to Watch later
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F2F2F2] transition-colors"
              >
                <RiShareForwardLine className="w-5 h-5" />
                Share
              </button>
              {isOwner && (
                <>
                  <hr className="my-2 border-[#E5E5E5]" />
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F2F2F2] transition-colors"
                  >
                    <FiEdit2 className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF0000] hover:bg-[#F2F2F2] transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
