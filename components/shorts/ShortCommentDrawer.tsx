'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { formatTimeAgo } from '@/lib/utils';
import { IoClose, IoSend } from 'react-icons/io5';
import { GoVerified } from 'react-icons/go';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface ShortCommentDrawerProps {
  shortId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export default function ShortCommentDrawer({
  shortId,
  isOpen,
  onClose,
  onCommentAdded,
}: ShortCommentDrawerProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch comments when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, shortId]);

  const fetchComments = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shorts/${shortId}/comments?page=${pageNum}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/shorts/${shortId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScroll = () => {
    if (!commentsContainerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = commentsContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchComments(page + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-[#212121] rounded-t-3xl z-50 flex flex-col max-h-[70vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white font-semibold">Comments</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <IoClose className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Comments List */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={handleScroll}
        >
          {loading && comments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No comments yet</p>
              <p className="text-white/40 text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    {comment.userId.avatar ? (
                      <img
                        src={comment.userId.avatar}
                        alt={comment.userId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EF6C00] flex items-center justify-center text-white text-sm font-medium">
                        {comment.userId.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-white/80 text-sm font-medium">
                        {comment.userId.name}
                      </span>
                      {comment.userId.verified && (
                        <GoVerified className="w-3.5 h-3.5 text-white/60" />
                      )}
                      <span className="text-white/40 text-xs">
                        • {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-white text-sm mt-0.5 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {loading && comments.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        <form 
          onSubmit={handleSubmit}
          className="flex items-center gap-3 p-4 border-t border-white/10"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            {(session?.user as { avatar?: string })?.avatar ? (
              <img
                src={(session?.user as { avatar?: string })?.avatar}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#3EA6FF] flex items-center justify-center text-white text-sm font-medium">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? 'Add a comment...' : 'Sign in to comment'}
            disabled={!session || submitting}
            className="flex-1 bg-white/10 text-white placeholder-white/40 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
            maxLength={1000}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!newComment.trim() || !session || submitting}
            className="w-9 h-9 rounded-full bg-[#3EA6FF] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3EA6FF]/80 transition-colors"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <IoSend className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

