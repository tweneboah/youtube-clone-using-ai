'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from 'react-icons/ai';
import { formatViews } from '@/lib/utils';

interface LikeDislikeButtonProps {
  videoId: string;
  initialUserAction: 'liked' | 'disliked' | null;
  initialLikeCount: number;
  initialDislikeCount: number;
  isLoggedIn: boolean;
}

export default function LikeDislikeButton({
  videoId,
  initialUserAction,
  initialLikeCount,
  initialDislikeCount,
  isLoggedIn,
}: LikeDislikeButtonProps) {
  const [userAction, setUserAction] = useState(initialUserAction);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (type: 'like' | 'dislike') => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserAction(data.userAction);
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
      }
    } catch (error) {
      console.error('Like/dislike error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center bg-[#F6F6F6] rounded-full overflow-hidden">
      {/* Like Button */}
      <button
        onClick={() => handleAction('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 transition-colors ${
          userAction === 'liked'
            ? 'bg-[#66E3D3] text-white'
            : 'text-[#555555] hover:bg-[#ECECEC]'
        } ${!isLoggedIn ? 'opacity-50' : ''} disabled:cursor-wait`}
      >
        {userAction === 'liked' ? (
          <AiFillLike className="w-5 h-5" />
        ) : (
          <AiOutlineLike className="w-5 h-5" />
        )}
        <span className="font-medium text-sm">{formatViews(likeCount)}</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[#DCDCDC]" />

      {/* Dislike Button */}
      <button
        onClick={() => handleAction('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 transition-colors ${
          userAction === 'disliked'
            ? 'bg-[#FF812B] text-white'
            : 'text-[#555555] hover:bg-[#ECECEC]'
        } ${!isLoggedIn ? 'opacity-50' : ''} disabled:cursor-wait`}
      >
        {userAction === 'disliked' ? (
          <AiFillDislike className="w-5 h-5" />
        ) : (
          <AiOutlineDislike className="w-5 h-5" />
        )}
        {dislikeCount > 0 && (
          <span className="font-medium text-sm">{formatViews(dislikeCount)}</span>
        )}
      </button>
    </div>
  );
}

