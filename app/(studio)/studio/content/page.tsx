'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/utils';
import {
  MdOutlineFilterList,
  MdOutlineSearch,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineVisibility,
  MdOutlineThumbUp,
  MdOutlineComment,
  MdOutlineMoreVert,
  MdOutlineVideoLibrary,
  MdAdd,
  MdCheck,
} from 'react-icons/md';
import { HiOutlineGlobeAlt } from 'react-icons/hi2';
import { SiYoutubeshorts } from 'react-icons/si';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  category: string;
  createdAt: string;
}

interface Short {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: string[];
  createdAt: string;
}

type ContentTab = 'videos' | 'shorts' | 'live' | 'playlists';

export default function ContentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentTab>('videos');
  
  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  // Shorts state
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loadingShorts, setLoadingShorts] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Edit state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingShort, setEditingShort] = useState<Short | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [shortEditForm, setShortEditForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const userId = (session?.user as { id?: string })?.id;

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

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/videos/channel/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [userId]);

  // Fetch shorts
  useEffect(() => {
    const fetchShorts = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/shorts/channel/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setShorts(data.shorts || []);
        }
      } catch (error) {
        console.error('Failed to fetch shorts:', error);
      } finally {
        setLoadingShorts(false);
      }
    };

    fetchShorts();
  }, [userId]);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedItems([]);
    setSearchQuery('');
  }, [activeTab]);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShorts = shorts.filter((short) =>
    short.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentItems = activeTab === 'videos' ? filteredVideos : filteredShorts;

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map((item) => item._id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Video editing
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || '',
      category: video.category,
    });
    setMenuOpenId(null);
  };

  const handleSaveVideoEdit = async () => {
    if (!editingVideo) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${editingVideo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setVideos((prev) =>
          prev.map((v) => (v._id === editingVideo._id ? { ...v, ...data.video } : v))
        );
        setEditingVideo(null);
      }
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Short editing
  const handleEditShort = (short: Short) => {
    setEditingShort(short);
    setShortEditForm({
      title: short.title,
      description: short.description || '',
    });
    setMenuOpenId(null);
  };

  const handleSaveShortEdit = async () => {
    if (!editingShort) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/shorts/${editingShort._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shortEditForm),
      });

      if (res.ok) {
        const data = await res.json();
        setShorts((prev) =>
          prev.map((s) => (s._id === editingShort._id ? { ...s, ...data.short } : s))
        );
        setEditingShort(null);
      }
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.'))
      return;

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== videoId));
        setSelectedItems((prev) => prev.filter((id) => id !== videoId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    setMenuOpenId(null);
  };

  const handleDeleteShort = async (shortId: string) => {
    if (!confirm('Are you sure you want to delete this Short? This action cannot be undone.'))
      return;

    try {
      const res = await fetch(`/api/shorts/${shortId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShorts((prev) => prev.filter((s) => s._id !== shortId));
        setSelectedItems((prev) => prev.filter((id) => id !== shortId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    setMenuOpenId(null);
  };

  const isLoading = activeTab === 'videos' ? loadingVideos : loadingShorts;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-[#E5E5E5] rounded" />
        <div className="h-12 bg-[#E5E5E5] rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#E5E5E5] rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Video Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">Edit video</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#606060] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8]"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#606060] mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8] resize-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#606060] mb-1">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2 text-sm font-medium text-[#606060] hover:bg-[#F2F2F2] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideoEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#065FD4] rounded hover:bg-[#065FD4]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Short Edit Modal */}
      {editingShort && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <SiYoutubeshorts className="w-5 h-5 text-[#FF0000]" />
              <h2 className="text-lg font-medium text-[#0F0F0F]">Edit Short</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#606060] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={shortEditForm.title}
                  onChange={(e) => setShortEditForm({ ...shortEditForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8]"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#606060] mb-1">
                  Description
                </label>
                <textarea
                  value={shortEditForm.description}
                  onChange={(e) => setShortEditForm({ ...shortEditForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8] resize-none"
                  rows={4}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingShort(null)}
                className="px-4 py-2 text-sm font-medium text-[#606060] hover:bg-[#F2F2F2] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShortEdit}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#065FD4] rounded hover:bg-[#065FD4]/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[#0F0F0F]">Channel content</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-[#065FD4] text-white text-sm font-medium rounded hover:bg-[#065FD4]/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Upload
          </Link>
          <Link
            href="/upload/short"
            className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white text-sm font-medium rounded hover:bg-[#CC0000] transition-colors"
          >
            <SiYoutubeshorts className="w-4 h-4" />
            Short
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E5E5] mb-4">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'text-[#0F0F0F] border-[#0F0F0F]'
              : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('shorts')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'shorts'
              ? 'text-[#0F0F0F] border-[#0F0F0F]'
              : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
          }`}
        >
          Shorts
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'live'
              ? 'text-[#0F0F0F] border-[#0F0F0F]'
              : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
          }`}
        >
          Live
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'playlists'
              ? 'text-[#0F0F0F] border-[#0F0F0F]'
              : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
          }`}
        >
          Playlists
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
          <input
            type="text"
            placeholder="Filter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#CCCCCC] rounded text-sm focus:outline-none focus:border-[#1A73E8]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#CCCCCC] rounded text-sm text-[#606060] hover:bg-[#F2F2F2] transition-colors">
          <MdOutlineFilterList className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Videos Tab Content */}
      {activeTab === 'videos' && (
        <>
          {filteredVideos.length > 0 ? (
            <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_100px_100px_100px_100px_50px] gap-4 px-4 py-3 bg-[#F9F9F9] border-b border-[#E5E5E5] text-xs font-medium text-[#606060]">
                <div>
                  <button
                    onClick={handleSelectAll}
                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                      selectedItems.length === filteredVideos.length
                        ? 'bg-[#065FD4] border-[#065FD4] text-white'
                        : 'border-[#CCCCCC]'
                    }`}
                  >
                    {selectedItems.length === filteredVideos.length && (
                      <MdCheck className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>Video</div>
                <div>Visibility</div>
                <div>Date</div>
                <div>Views</div>
                <div>Likes</div>
                <div></div>
              </div>

              {/* Table Body */}
              {filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className="grid grid-cols-[40px_1fr_100px_100px_100px_100px_50px] gap-4 px-4 py-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9] items-center"
                >
                  {/* Checkbox */}
                  <div>
                    <button
                      onClick={() => handleSelectItem(video._id)}
                      className={`w-5 h-5 border rounded flex items-center justify-center ${
                        selectedItems.includes(video._id)
                          ? 'bg-[#065FD4] border-[#065FD4] text-white'
                          : 'border-[#CCCCCC]'
                      }`}
                    >
                      {selectedItems.includes(video._id) && <MdCheck className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Video Info */}
                  <div className="flex gap-3 min-w-0">
                    <Link
                      href={`/watch/${video._id}`}
                      className="relative flex-shrink-0"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-[72px] rounded object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                        {formatDuration(video.duration)}
                      </span>
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/watch/${video._id}`}
                        className="text-sm font-medium text-[#0F0F0F] line-clamp-2 hover:text-[#065FD4]"
                      >
                        {video.title}
                      </Link>
                      <p className="text-xs text-[#606060] line-clamp-1 mt-1">
                        {video.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center gap-1 text-xs text-[#606060]">
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                    Public
                  </div>

                  {/* Date */}
                  <div className="text-xs text-[#606060]">
                    {new Date(video.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Views */}
                  <div className="text-xs text-[#606060]">{formatViews(video.views)}</div>

                  {/* Likes */}
                  <div className="text-xs text-[#606060]">—</div>

                  {/* Actions */}
                  <div className="relative z-30">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === video._id ? null : video._id)}
                      className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                    >
                      <MdOutlineMoreVert className="w-5 h-5 text-[#606060]" />
                    </button>
                    {menuOpenId === video._id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#0F0F0F] hover:bg-[#F2F2F2]"
                          >
                            <MdOutlineEdit className="w-5 h-5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#D32F2F] hover:bg-[#F2F2F2]"
                          >
                            <MdOutlineDelete className="w-5 h-5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-lg">
              <MdOutlineVideoLibrary className="w-16 h-16 text-[#909090] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#0F0F0F] mb-2">
                {searchQuery ? 'No videos found' : 'No videos yet'}
              </h3>
              <p className="text-sm text-[#606060] mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Upload a video to get started'}
              </p>
              {!searchQuery && (
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#065FD4] text-white text-sm font-medium rounded hover:bg-[#065FD4]/90 transition-colors"
                >
                  <MdAdd className="w-5 h-5" />
                  Upload video
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Shorts Tab Content */}
      {activeTab === 'shorts' && (
        <>
          {filteredShorts.length > 0 ? (
            <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_100px_100px_100px_100px_50px] gap-4 px-4 py-3 bg-[#F9F9F9] border-b border-[#E5E5E5] text-xs font-medium text-[#606060]">
                <div>
                  <button
                    onClick={handleSelectAll}
                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                      selectedItems.length === filteredShorts.length
                        ? 'bg-[#065FD4] border-[#065FD4] text-white'
                        : 'border-[#CCCCCC]'
                    }`}
                  >
                    {selectedItems.length === filteredShorts.length && (
                      <MdCheck className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>Short</div>
                <div>Visibility</div>
                <div>Date</div>
                <div>Views</div>
                <div>Likes</div>
                <div></div>
              </div>

              {/* Table Body */}
              {filteredShorts.map((short) => (
                <div
                  key={short._id}
                  className="grid grid-cols-[40px_1fr_100px_100px_100px_100px_50px] gap-4 px-4 py-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9] items-center"
                >
                  {/* Checkbox */}
                  <div>
                    <button
                      onClick={() => handleSelectItem(short._id)}
                      className={`w-5 h-5 border rounded flex items-center justify-center ${
                        selectedItems.includes(short._id)
                          ? 'bg-[#065FD4] border-[#065FD4] text-white'
                          : 'border-[#CCCCCC]'
                      }`}
                    >
                      {selectedItems.includes(short._id) && <MdCheck className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Short Info */}
                  <div className="flex gap-3 min-w-0">
                    <Link
                      href={`/shorts/${short._id}`}
                      className="relative flex-shrink-0"
                    >
                      <img
                        src={short.thumbnailUrl}
                        alt={short.title}
                        className="w-16 h-[72px] rounded object-cover"
                      />
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
                        <SiYoutubeshorts className="w-3 h-3 text-[#FF0000]" />
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                        {short.duration}s
                      </span>
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/shorts/${short._id}`}
                        className="text-sm font-medium text-[#0F0F0F] line-clamp-2 hover:text-[#065FD4]"
                      >
                        {short.title}
                      </Link>
                      <p className="text-xs text-[#606060] line-clamp-1 mt-1">
                        {short.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center gap-1 text-xs text-[#606060]">
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                    Public
                  </div>

                  {/* Date */}
                  <div className="text-xs text-[#606060]">
                    {new Date(short.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Views */}
                  <div className="text-xs text-[#606060]">{formatViews(short.views)}</div>

                  {/* Likes */}
                  <div className="text-xs text-[#606060]">{formatViews(short.likes?.length || 0)}</div>

                  {/* Actions */}
                  <div className="relative z-30">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === short._id ? null : short._id)}
                      className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                    >
                      <MdOutlineMoreVert className="w-5 h-5 text-[#606060]" />
                    </button>
                    {menuOpenId === short._id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#E5E5E5] py-2 z-50">
                          <button
                            onClick={() => handleEditShort(short)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#0F0F0F] hover:bg-[#F2F2F2]"
                          >
                            <MdOutlineEdit className="w-5 h-5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShort(short._id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#D32F2F] hover:bg-[#F2F2F2]"
                          >
                            <MdOutlineDelete className="w-5 h-5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-lg">
              <SiYoutubeshorts className="w-16 h-16 text-[#909090] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#0F0F0F] mb-2">
                {searchQuery ? 'No Shorts found' : 'No Shorts yet'}
              </h3>
              <p className="text-sm text-[#606060] mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create a Short to engage your audience with vertical videos'}
              </p>
              {!searchQuery && (
                <Link
                  href="/upload/short"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#FF0000] text-white text-sm font-medium rounded hover:bg-[#CC0000] transition-colors"
                >
                  <SiYoutubeshorts className="w-4 h-4" />
                  Create Short
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Live Tab Content */}
      {activeTab === 'live' && (
        <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-lg">
          <MdOutlineVideoLibrary className="w-16 h-16 text-[#909090] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#0F0F0F] mb-2">No live streams</h3>
          <p className="text-sm text-[#606060] mb-4">
            Past live streams will appear here
          </p>
          <Link
            href="/studio/live"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#FF0000] text-white text-sm font-medium rounded hover:bg-[#CC0000] transition-colors"
          >
            Go Live
          </Link>
        </div>
      )}

      {/* Playlists Tab Content */}
      {activeTab === 'playlists' && (
        <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-lg">
          <MdOutlineVideoLibrary className="w-16 h-16 text-[#909090] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#0F0F0F] mb-2">No playlists</h3>
          <p className="text-sm text-[#606060] mb-4">
            Create playlists to organize your videos
          </p>
        </div>
      )}
    </div>
  );
}
