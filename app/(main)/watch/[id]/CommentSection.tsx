'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import { FiEdit2, FiTrash2, FiMoreVertical, FiX, FiCheck } from 'react-icons/fi';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { IoChevronDown } from 'react-icons/io5';
import { BsSortDown } from 'react-icons/bs';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  currentUserId: string | null;
}

export default function CommentSection({
  videoId,
  comments: initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, content: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
        setInputFocused(false);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${videoId}/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((c) =>
            c._id === commentId ? { ...c, content: data.comment.content } : c
          )
        );
        setEditingId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${videoId}/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
    setMenuOpenId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="mt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-xl font-bold text-[#0F0F0F]">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 text-sm font-medium text-[#0F0F0F] hover:bg-[#F2F2F2] px-3 py-2 rounded-full transition-colors"
          >
            <BsSortDown className="w-5 h-5" />
            Sort by
          </button>
          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-20">
                <button
                  onClick={() => setShowSortMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F2F2F2]"
                >
                  Top comments
                </button>
                <button
                  onClick={() => setShowSortMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#F2F2F2]"
                >
                  Newest first
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {currentUserId ? (
        <div className="flex gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#EF6C00] flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            G
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setInputFocused(true)}
              placeholder="Add a comment..."
              className="w-full px-0 py-2 text-sm text-[#0F0F0F] placeholder-[#606060] bg-transparent border-b border-[#E5E5E5] focus:border-[#0F0F0F] focus:outline-none transition-colors"
            />
            {inputFocused && (
              <div className="flex justify-end mt-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewComment('');
                    setInputFocused(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#0F0F0F] rounded-full hover:bg-[#F2F2F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 text-sm font-medium bg-[#065FD4] text-white rounded-full hover:bg-[#065FD4]/90 transition-colors disabled:opacity-50 disabled:bg-[#F2F2F2] disabled:text-[#909090] disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#606060]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="flex-1">
            <Link
              href="/login"
              className="block w-full px-0 py-2 text-sm text-[#606060] border-b border-[#E5E5E5] cursor-pointer hover:text-[#0F0F0F]"
            >
              Sign in to comment
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4 group">
            <Link href={`/channel/${comment.userId._id}`} className="flex-shrink-0">
              {comment.userId.avatar ? (
                <img
                  src={comment.userId.avatar}
                  alt={comment.userId.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#EF6C00] flex items-center justify-center text-white font-medium text-sm">
                  {comment.userId.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href={`/channel/${comment.userId._id}`}
                  className="text-[13px] font-medium text-[#0F0F0F] hover:text-[#0F0F0F]/80"
                >
                  @{comment.userId.name.toLowerCase().replace(/\s/g, '')}
                </Link>
                <span className="text-xs text-[#606060]">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>

              {editingId === comment._id ? (
                /* Edit Mode */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-0 py-1 text-sm text-[#0F0F0F] bg-transparent border-b border-[#0F0F0F] focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm font-medium text-[#0F0F0F] rounded-full hover:bg-[#F2F2F2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(comment._id)}
                      disabled={loading || !editContent.trim()}
                      className="px-3 py-1.5 text-sm font-medium bg-[#065FD4] text-white rounded-full hover:bg-[#065FD4]/90 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <p className="text-sm text-[#0F0F0F] break-words">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                      <AiOutlineLike className="w-4 h-4 text-[#606060]" />
                    </button>
                    <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                      <AiOutlineDislike className="w-4 h-4 text-[#606060]" />
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-[#0F0F0F] hover:bg-[#F2F2F2] rounded-full transition-colors">
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Actions Menu */}
            {currentUserId === comment.userId._id && editingId !== comment._id && (
              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === comment._id ? null : comment._id)
                  }
                  className="p-2 rounded-full hover:bg-[#F2F2F2] transition-colors"
                >
                  <FiMoreVertical className="w-4 h-4 text-[#606060]" />
                </button>

                {menuOpenId === comment._id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-1 z-20">
                      <button
                        onClick={() => startEdit(comment)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0F0F0F] hover:bg-[#F2F2F2] transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          handleDelete(comment._id);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#FF0000] hover:bg-[#F2F2F2] transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-sm text-[#606060] py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
