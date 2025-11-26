'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface VideoActionsProps {
  videoId: string;
  video: {
    title: string;
    description: string;
    category: string;
  };
}

export default function VideoActions({ videoId, video }: VideoActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: video.title,
    description: video.description,
    category: video.category,
  });
  const router = useRouter();

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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setShowEditModal(false);
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

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Action Button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-[#F6F6F6] transition-colors"
        >
          <BsThreeDotsVertical className="w-5 h-5 text-[#555555]" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#ECECEC] py-2 z-20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEditModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#555555] hover:bg-[#F6F6F6] transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Video
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#FF0000] hover:bg-[#F6F6F6] transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Video
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#111111] mb-4">Edit Video</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F6F6F6] rounded-xl text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#66E3D3]"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F6F6F6] rounded-xl text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#66E3D3] resize-none"
                  rows={4}
                  maxLength={5000}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-1">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F6F6F6] rounded-xl text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#66E3D3]"
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
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-[#555555] font-medium hover:bg-[#F6F6F6] rounded-full transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#66E3D3] text-white font-medium rounded-full hover:bg-[#5BD26D] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#111111] mb-2">Delete Video</h2>
            <p className="text-[#555555] mb-6">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-[#555555] font-medium hover:bg-[#F6F6F6] rounded-full transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2 bg-[#FF0000] text-white font-medium rounded-full hover:bg-[#CC0000] transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

