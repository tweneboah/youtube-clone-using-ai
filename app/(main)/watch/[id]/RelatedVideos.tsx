'use client';

import Link from 'next/link';
import { formatViews, formatDuration, formatTimeAgo } from '@/lib/utils';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoVerified } from 'react-icons/go';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface RelatedVideosProps {
  videos: Video[];
  currentUserId?: string | null;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <div key={video._id} className="group flex gap-2">
          {/* Thumbnail */}
          <Link
            href={`/watch/${video._id}`}
            className="flex-shrink-0 relative w-[168px] aspect-video rounded-xl overflow-hidden bg-[#F2F2F2]"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
              {formatDuration(video.duration)}
            </span>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-6 relative">
            <Link href={`/watch/${video._id}`}>
              <h3 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 leading-5 mb-1">
                {video.title}
              </h3>
            </Link>
            <Link
              href={`/channel/${video.userId._id}`}
              className="flex items-center gap-1 text-xs text-[#606060] hover:text-[#0F0F0F] transition-colors"
            >
              <span>{video.userId.name}</span>
              <GoVerified className="w-3 h-3 text-[#606060]" />
            </Link>
            <p className="text-xs text-[#606060]">
              {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
            </p>

            {/* Menu Button */}
            <button className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F2F2F2] rounded-full">
              <BsThreeDotsVertical className="w-4 h-4 text-[#606060]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
