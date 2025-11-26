'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscribeButtonProps {
  channelId: string;
  initialSubscribed: boolean;
  isLoggedIn: boolean;
}

export default function SubscribeButton({
  channelId,
  initialSubscribed,
  isLoggedIn,
}: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint = subscribed
        ? `/api/users/${channelId}/unsubscribe`
        : `/api/users/${channelId}/subscribe`;

      const res = await fetch(endpoint, {
        method: 'POST',
      });

      if (res.ok) {
        setSubscribed(!subscribed);
        router.refresh();
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-6 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50 ${
        subscribed
          ? 'bg-[#F6F6F6] text-[#555555] hover:bg-[#ECECEC]'
          : 'bg-[#FF0000] text-white hover:bg-[#CC0000]'
      }`}
    >
      {loading ? '...' : subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
}

