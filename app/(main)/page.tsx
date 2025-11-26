'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import VideoCard from '@/components/VideoCard';
import CategoryPills from '@/components/CategoryPills';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  category?: string;
  description?: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

const categories = [
  'All',
  'AI',
  'Music',
  'JavaScript',
  'Martial Arts Movies',
  'Nollywood',
  'Mixes',
  'African Music',
  'Live',
  'Soul Music',
  'Contemporary Worship Music',
  'Recently uploaded',
  'New to you',
  'Gaming',
  'Programming',
  'News',
  'Sports',
  'Education',
  'Entertainment',
  'Technology',
];

export default function HomePage() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const currentUserId = (session?.user as { id?: string })?.id || null;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const url =
          selectedCategory === 'All'
            ? '/api/videos'
            : `/api/videos/category/${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  const handleDelete = (videoId: string) => {
    setVideos(videos.filter((v) => v._id !== videoId));
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="sticky top-14 bg-white z-40 py-3 -mx-6 px-6 border-b border-[#E5E5E5]">
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-[#E5E5E5] rounded-xl" />
              <div className="flex gap-3 mt-3">
                <div className="w-9 h-9 bg-[#E5E5E5] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E5E5E5] rounded w-full" />
                  <div className="h-3 bg-[#E5E5E5] rounded w-3/4" />
                  <div className="h-3 bg-[#E5E5E5] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              isOwner={currentUserId ? video.userId._id === currentUserId : false}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
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
            No videos found
          </h3>
          <p className="text-[#606060]">
            {selectedCategory === 'All'
              ? 'Be the first to upload a video!'
              : `No videos in "${selectedCategory}" category yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
