'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineThumbUp,
  MdOutlineThumbDown,
  MdFavoriteBorder,
  MdMoreVert,
  MdFilterList,
  MdOutlineOpenInNew,
} from 'react-icons/md';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  videoId: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  likes: number;
  replies: Reply[];
  isOwnerReply?: boolean;
}

interface Reply {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  isOwner: boolean;
}

type TabType = 'comments' | 'viewerPosts' | 'mentions';

export default function CommunityPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishedFilter, setPublishedFilter] = useState('Published');
  const [sortBy, setSortBy] = useState('Sort by');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());

  const userId = (session?.user as { id?: string })?.id;
  const userName = (session?.user as { name?: string })?.name || 'Creator';

  const tabs: { id: TabType; label: string }[] = [
    { id: 'comments', label: 'Comments' },
    { id: 'viewerPosts', label: 'Viewer posts' },
    { id: 'mentions', label: 'Mentions' },
  ];

  useEffect(() => {
    const fetchComments = async () => {
      if (!userId) return;

      try {
        // Fetch all comments on the creator's videos
        const videosRes = await fetch(`/api/videos/channel/${userId}`);
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          const videos = videosData.videos || [];

          // Fetch comments for each video
          const allComments: Comment[] = [];
          for (const video of videos.slice(0, 5)) {
            const commentsRes = await fetch(`/api/comments/${video._id}`);
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json();
              const videoComments = (commentsData.comments || []).map((c: Comment) => ({
                ...c,
                videoId: {
                  _id: video._id,
                  title: video.title,
                  thumbnail: video.thumbnail,
                },
                replies: [],
                likes: Math.floor(Math.random() * 5),
              }));
              allComments.push(...videoComments);
            }
          }
          setComments(allComments);
        }
      } catch (error) {
        console.error('Community fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userId]);

  // Mock data for demo
  const mockComments: Comment[] = [
    {
      _id: '1',
      content: 'Amazing',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: { _id: 'u1', name: 'gobrite', avatar: '' },
      videoId: { _id: 'v1', title: 'Convert Website to App React Native — Turn Any Website Into a Real App ...', thumbnail: '/api/placeholder/120/68' },
      likes: 0,
      replies: [
        {
          _id: 'r1',
          content: 'Thanks a lot!',
          createdAt: new Date(Date.now() - 28800000).toISOString(),
          userId: { _id: userId || 'owner', name: userName, avatar: '' },
          likes: 0,
          isOwner: true,
        },
      ],
    },
    {
      _id: '2',
      content: "This is the first time I've seen someone break down AI-powered development so clearly. The way you explained why we use PRDs, how Cursor agents work, and how to fix common errors made the whole process feel achievable. This video deserves way more views! 🚀",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      userId: { _id: 'u2', name: 'novotv8179', avatar: '' },
      videoId: { _id: 'v2', title: 'Build and Deploy a Full-Stack File Sharing App with Cursor AI (Next.js + MongoDB)', thumbnail: '/api/placeholder/120/68' },
      likes: 2,
      replies: [
        {
          _id: 'r2',
          content: "I'm really glad you found the breakdown clear and the process achievable! Thanks for the kind words. 🙌",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          userId: { _id: userId || 'owner', name: userName, avatar: '' },
          likes: 1,
          isOwner: true,
        },
      ],
    },
    {
      _id: '3',
      content: "This was insanely comprehensive! I love how you didn't just show the final result, but walked through the entire process — PRD, Cursor rules, MongoDB setup, Cloudinary, Google OAuth, UI redesign, deployment — everything! It felt like a full masterclass, not just a tutorial. 🔥",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      userId: { _id: 'u3', name: 'akosuaakyeremu', avatar: '' },
      videoId: { _id: 'v2', title: 'Build and Deploy a Full-Stack File Sharing App with Cursor AI (Next.js + MongoDB)', thumbnail: '/api/placeholder/120/68' },
      likes: 2,
      replies: [
        {
          _id: 'r3',
          content: "Thank you so much! I really appreciate that you noticed all the details. It takes time to put together these comprehensive tutorials, so feedback like this really motivates me! 🙏",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          userId: { _id: userId || 'owner', name: userName, avatar: '' },
          likes: 0,
          isOwner: true,
        },
      ],
    },
  ];

  const displayComments = comments.length > 0 ? comments : mockComments;

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const toggleSelectComment = (commentId: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-[#E5E5E5] rounded" />
        <div className="h-12 w-full max-w-md bg-[#E5E5E5] rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#E5E5E5] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <h1 className="text-[22px] font-normal text-[#0F0F0F] mb-4">Community</h1>

      {/* Tabs */}
      <div className="border-b border-[#E5E5E5] mb-4">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#0F0F0F] border-[#0F0F0F]'
                  : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'comments' && (
        <>
          {/* Filter Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
              <MdFilterList className="w-5 h-5 text-[#606060]" />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D3D3D3] rounded hover:bg-[#F2F2F2] transition-colors">
              <span className="text-sm text-[#0F0F0F]">{publishedFilter}</span>
              <MdKeyboardArrowDown className="w-5 h-5 text-[#606060]" />
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#D3D3D3] rounded hover:bg-[#F2F2F2] transition-colors">
              <span className="text-sm text-[#0F0F0F]">{sortBy}</span>
              <MdKeyboardArrowDown className="w-5 h-5 text-[#606060]" />
            </button>
            <span className="text-sm text-[#606060]">Filter</span>
          </div>

          {/* Select All Checkbox */}
          <div className="flex items-center gap-3 py-2 border-b border-[#E5E5E5]">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#909090] cursor-pointer"
              onChange={() => {
                if (selectedComments.size === displayComments.length) {
                  setSelectedComments(new Set());
                } else {
                  setSelectedComments(new Set(displayComments.map((c) => c._id)));
                }
              }}
              checked={selectedComments.size === displayComments.length && displayComments.length > 0}
            />
          </div>

          {/* Comments List */}
          <div className="space-y-0">
            {displayComments.map((comment) => (
              <div key={comment._id} className="border-b border-[#E5E5E5]">
                {/* Main Comment */}
                <div className="flex gap-3 py-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#909090] cursor-pointer mt-2"
                    checked={selectedComments.has(comment._id)}
                    onChange={() => toggleSelectComment(comment._id)}
                  />

                  {/* Avatar */}
                  {comment.userId.avatar ? (
                    <img
                      src={comment.userId.avatar}
                      alt={comment.userId.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(comment.userId.name)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                    >
                      {getInitials(comment.userId.name)}
                    </div>
                  )}

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-[#606060]">@{comment.userId.name}</span>
                      <span className="text-xs text-[#606060]">·</span>
                      <span className="text-xs text-[#606060]">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#0F0F0F] mb-2">{comment.content}</p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-sm font-medium rounded-full hover:bg-[#272727] transition-colors">
                        Reply
                      </button>
                      {comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="flex items-center gap-1 px-2 py-1.5 text-sm text-[#0F0F0F] hover:bg-[#F2F2F2] rounded-full transition-colors"
                        >
                          <span>{comment.replies.length} reply</span>
                          {expandedReplies.has(comment._id) ? (
                            <MdKeyboardArrowUp className="w-5 h-5" />
                          ) : (
                            <MdKeyboardArrowDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                        <MdOutlineThumbUp className="w-5 h-5 text-[#606060]" />
                      </button>
                      {comment.likes > 0 && (
                        <span className="text-xs text-[#606060]">{comment.likes}</span>
                      )}
                      <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                        <MdOutlineThumbDown className="w-5 h-5 text-[#606060]" />
                      </button>
                      <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                        <MdFavoriteBorder className="w-5 h-5 text-[#606060]" />
                      </button>
                      <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                        <MdMoreVert className="w-5 h-5 text-[#606060]" />
                      </button>
                    </div>

                    {/* Replies */}
                    {expandedReplies.has(comment._id) && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-3">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-[#909090] cursor-pointer mt-2"
                            />
                            {reply.isOwner ? (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">🦊</span>
                              </div>
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full ${getAvatarColor(reply.userId.name)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                              >
                                {getInitials(reply.userId.name)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {reply.isOwner && (
                                  <span className="px-2 py-0.5 bg-[#E5E5E5] text-xs text-[#0F0F0F] rounded font-medium">
                                    @{reply.userId.name}
                                  </span>
                                )}
                                {!reply.isOwner && (
                                  <span className="text-sm text-[#606060]">@{reply.userId.name}</span>
                                )}
                                <span className="text-xs text-[#606060]">·</span>
                                <span className="text-xs text-[#606060]">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm text-[#0F0F0F] mb-2">{reply.content}</p>
                              <div className="flex items-center gap-1">
                                <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-sm font-medium rounded-full hover:bg-[#272727] transition-colors">
                                  Reply
                                </button>
                                <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                                  <MdOutlineThumbUp className="w-5 h-5 text-[#606060]" />
                                </button>
                                {reply.likes > 0 && (
                                  <span className="text-xs text-[#606060]">{reply.likes}</span>
                                )}
                                <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                                  <MdOutlineThumbDown className="w-5 h-5 text-[#606060]" />
                                </button>
                                <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                                  <MdFavoriteBorder className="w-5 h-5 text-[#606060]" />
                                </button>
                                <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
                                  <MdMoreVert className="w-5 h-5 text-[#606060]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Thumbnail */}
                  <Link
                    href={`/watch/${comment.videoId._id}`}
                    className="flex-shrink-0 group relative"
                  >
                    <img
                      src={comment.videoId.thumbnail}
                      alt={comment.videoId.title}
                      className="w-[120px] h-[68px] rounded object-cover"
                    />
                    <div className="mt-1 max-w-[120px]">
                      <p className="text-xs text-[#0F0F0F] line-clamp-2 group-hover:text-[#065FD4]">
                        {comment.videoId.title}
                      </p>
                    </div>
                    <button className="absolute top-1 right-1 p-1 bg-white/90 rounded hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                      <MdOutlineOpenInNew className="w-4 h-4 text-[#606060]" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {displayComments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-[#606060]">No comments yet</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'viewerPosts' && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
          <p className="text-sm text-[#606060]">No viewer posts yet</p>
        </div>
      )}

      {activeTab === 'mentions' && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
          <p className="text-sm text-[#606060]">No mentions yet</p>
        </div>
      )}
    </div>
  );
}


