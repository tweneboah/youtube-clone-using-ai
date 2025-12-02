'use client';

import Link from 'next/link';
import { formatViews } from '@/lib/utils';
import { GoVerified } from 'react-icons/go';

interface LiveCardProps {
  stream: {
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
  };
  variant?: 'default' | 'compact';
}

export default function LiveCard({ stream, variant = 'default' }: LiveCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/live/${stream._id}`}
        className="flex gap-3 group hover:bg-[#F2F2F2] rounded-lg p-2 transition-colors"
      >
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-[#F2F2F2] flex-shrink-0">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">LIVE</span>
            </div>
          )}
          {/* LIVE Badge */}
          <div className="absolute top-1 left-1">
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
          {/* Viewer count */}
          <div className="absolute bottom-1 right-1">
            <span className="px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
              {formatViews(stream.viewers)} watching
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h4 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 group-hover:text-[#065FD4]">
            {stream.title}
          </h4>
          <p className="text-xs text-[#606060] mt-1">{stream.creatorId.name}</p>
          <p className="text-xs text-[#606060]">{stream.category}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/live/${stream._id}`} className="block group">
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F2F2F2]">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">LIVE</span>
          </div>
        )}
        
        {/* LIVE Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded uppercase flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>

        {/* Viewer count */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
            {formatViews(stream.viewers)} watching
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3 mt-3">
        {/* Channel Avatar */}
        <Link
          href={`/channel/${stream.creatorId._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          {stream.creatorId.avatar ? (
            <img
              src={stream.creatorId.avatar}
              alt={stream.creatorId.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-sm font-medium">
              {stream.creatorId.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Stream Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 leading-5 mb-1 group-hover:text-[#065FD4]">
            {stream.title}
          </h3>
          <Link
            href={`/channel/${stream.creatorId._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-[#606060] hover:text-[#0F0F0F] transition-colors"
          >
            <span>{stream.creatorId.name}</span>
            {stream.creatorId.verified && (
              <GoVerified className="w-3.5 h-3.5 text-[#606060]" />
            )}
          </Link>
          <p className="text-xs text-[#606060] mt-0.5">{stream.category}</p>
        </div>
      </div>
    </Link>
  );
}

