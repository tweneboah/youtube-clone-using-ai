'use client';

import Link from 'next/link';
import { formatViews } from '@/lib/utils';
import { IoPlay } from 'react-icons/io5';

interface ShortCardProps {
  short: {
    _id: string;
    title: string;
    thumbnailUrl: string;
    views: number;
    duration: number;
    creatorId?: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  showCreator?: boolean;
}

export default function ShortCard({ short, showCreator = false }: ShortCardProps) {
  return (
    <Link 
      href={`/shorts/${short._id}`}
      className="group flex-shrink-0 block"
    >
      {/* Thumbnail Container - 9:16 aspect ratio */}
      <div className="relative w-[165px] h-[294px] rounded-xl overflow-hidden bg-[#F2F2F2]">
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <IoPlay className="w-6 h-6 text-[#0F0F0F] ml-1" />
          </div>
        </div>

        {/* Views Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
          <IoPlay className="w-3 h-3" />
          <span>{formatViews(short.views)}</span>
        </div>
      </div>

      {/* Title */}
      <div className="mt-2 w-[165px]">
        <h3 className="text-sm font-medium text-[#0F0F0F] line-clamp-2 leading-tight">
          {short.title}
        </h3>
        {showCreator && short.creatorId && (
          <p className="text-xs text-[#606060] mt-1 truncate">
            {short.creatorId.name}
          </p>
        )}
      </div>
    </Link>
  );
}

