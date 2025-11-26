'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from './VideoCard';

interface Video {
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
}

interface VideoGridProps {
  videos: Video[];
  title?: string;
  showViewMore?: boolean;
  currentUserId?: string | null;
  isChannelOwner?: boolean;
  variant?: 'grid' | 'list';
}

const categories = [
  'Gaming',
  'Music',
  'Education',
  'Entertainment',
  'Sports',
  'News',
  'Technology',
  'Lifestyle',
  'Comedy',
  'Other',
];

export default function VideoGrid({
  videos: initialVideos,
  title,
  currentUserId,
  isChannelOwner,
  variant = 'grid',
}: VideoGridProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = (videoId: string) => {
    setVideos(videos.filter((v) => v._id !== videoId));
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || '',
      category: video.category || 'Other',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${editingVideo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setVideos(
          videos.map((v) =>
            v._id === editingVideo._id
              ? {
                  ...v,
                  title: data.video.title,
                  description: data.video.description,
                  category: data.video.category,
                }
              : v
          )
        );
        setEditingVideo(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update video');
      }
    } catch (error) {
      console.error('Edit video error:', error);
      alert('Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'list') {
    return (
      <>
        <div className="space-y-4">
          {title && (
            <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">{title}</h2>
          )}
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              variant="list"
              isOwner={
                isChannelOwner ||
                (currentUserId ? video.userId._id === currentUserId : false)
              }
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}

          {/* Empty State */}
          {videos.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#909090]"
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
              <h3 className="text-lg font-medium text-[#0F0F0F] mb-1">
                No videos yet
              </h3>
              <p className="text-sm text-[#606060]">
                Be the first to upload a video!
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingVideo && (
          <EditModal
            editForm={editForm}
            setEditForm={setEditForm}
            loading={loading}
            onSubmit={handleEditSubmit}
            onClose={() => setEditingVideo(null)}
            categories={categories}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div>
        {title && (
          <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">{title}</h2>
        )}
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              isOwner={
                isChannelOwner ||
                (currentUserId ? video.userId._id === currentUserId : false)
              }
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#909090]"
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
            <h3 className="text-lg font-medium text-[#0F0F0F] mb-1">
              No videos yet
            </h3>
            <p className="text-sm text-[#606060]">
              Be the first to upload a video!
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <EditModal
          editForm={editForm}
          setEditForm={setEditForm}
          loading={loading}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingVideo(null)}
          categories={categories}
        />
      )}
    </>
  );
}

// Edit Modal Component
function EditModal({
  editForm,
  setEditForm,
  loading,
  onSubmit,
  onClose,
  categories,
}: {
  editForm: { title: string; description: string; category: string };
  setEditForm: React.Dispatch<
    React.SetStateAction<{ title: string; description: string; category: string }>
  >;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  categories: string[];
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-xl font-medium text-[#0F0F0F] mb-4">Edit Video</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#606060] mb-1">
              Title
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#1C62B9] focus:ring-1 focus:ring-[#1C62B9]"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#606060] mb-1">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#1C62B9] focus:ring-1 focus:ring-[#1C62B9] resize-none"
              rows={4}
              maxLength={5000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#606060] mb-1">
              Category
            </label>
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#1C62B9] focus:ring-1 focus:ring-[#1C62B9]"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-[#065FD4] text-white rounded-full hover:bg-[#065FD4]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
