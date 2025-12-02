'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient, PUSHER_EVENTS, getStreamChannelName, ChatMessage } from '@/lib/pusher';
import { MdSend, MdPerson } from 'react-icons/md';

interface LiveChatProps {
  streamId: string;
  isLive: boolean;
}

export default function LiveChat({ streamId, isLive }: LiveChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/live/chat/${streamId}?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [streamId]);

  // Subscribe to Pusher for real-time messages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(getStreamChannelName(streamId));

    channel.bind(PUSHER_EVENTS.MESSAGE_NEW, (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getStreamChannelName(streamId));
    };
  }, [streamId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user || isSending || !isLive) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/live/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        setShouldAutoScroll(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
        <h3 className="font-semibold text-[#0F0F0F]">Live Chat</h3>
        <span className="text-xs text-[#606060]">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-[#E5E5E5] border-t-[#FF0000] rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#606060]">
            <MdPerson className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 group hover:bg-[#F2F2F2] rounded-lg p-2 -mx-2 transition-colors">
              {msg.userAvatar ? (
                <img
                  src={msg.userAvatar}
                  alt={msg.userName}
                  className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#EF6C00] flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">
                  {msg.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-[#0F0F0F] truncate">
                    {msg.userName}
                  </span>
                  <span className="text-[10px] text-[#909090] opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-[#0F0F0F] break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0F0F0F] text-white text-xs rounded-full shadow-lg hover:bg-[#272727] transition-colors"
        >
          New messages ↓
        </button>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#E5E5E5]">
        {session?.user ? (
          isLive ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                maxLength={500}
                className="flex-1 px-3 py-2 bg-[#F2F2F2] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000]/30"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-2 bg-[#FF0000] text-white rounded-full hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MdSend className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-sm text-[#606060]">
              Chat is disabled when stream is not live
            </div>
          )
        ) : (
          <div className="text-center py-2">
            <a
              href="/login"
              className="text-sm text-[#065FD4] hover:text-[#0056B3]"
            >
              Sign in to chat
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

