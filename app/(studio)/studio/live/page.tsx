'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import LiveStreamSetup, { StreamInfo } from '@/components/live/LiveStreamSetup';
import LivePlayer from '@/components/live/LivePlayer';
import { MdAdd, MdDelete, MdOpenInNew, MdRefresh } from 'react-icons/md';
import { formatTimeAgo, formatViews } from '@/lib/utils';

interface Stream {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  playbackUrl: string;
  ingestUrl: string;
  streamKey: string;
  isLive: boolean;
  ended: boolean;
  viewers: number;
  peakViewers: number;
  category: string;
  createdAt: string;
}

export default function LiveDashboardPage() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    const fetchStreams = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/live?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStreams(data.streams || []);
          
          // Set active stream to current live or most recent
          const liveStream = data.streams?.find((s: Stream) => s.isLive && !s.ended);
          const activeOrRecent = liveStream || data.streams?.find((s: Stream) => !s.ended);
          setActiveStream(activeOrRecent || null);
        }
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, [userId, refreshKey]);

  const handleStreamCreated = (stream: Stream) => {
    setStreams((prev) => [stream, ...prev]);
    setActiveStream(stream);
    setIsCreating(false);
  };

  const handleStartStream = async () => {
    if (!activeStream) return;

    setIsStarting(true);
    try {
      const res = await fetch('/api/live/start', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: activeStream._id }),
      });

      if (res.ok) {
        setActiveStream({ ...activeStream, isLive: true });
        setStreams((prev) =>
          prev.map((s) =>
            s._id === activeStream._id ? { ...s, isLive: true } : s
          )
        );
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndStream = async () => {
    if (!activeStream) return;

    if (!confirm('Are you sure you want to end this stream?')) return;

    setIsEnding(true);
    try {
      const res = await fetch('/api/live/end', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: activeStream._id }),
      });

      if (res.ok) {
        setActiveStream({ ...activeStream, isLive: false, ended: true });
        setStreams((prev) =>
          prev.map((s) =>
            s._id === activeStream._id ? { ...s, isLive: false, ended: true } : s
          )
        );
      }
    } catch (error) {
      console.error('Failed to end stream:', error);
    } finally {
      setIsEnding(false);
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;

    try {
      const res = await fetch(`/api/live/${streamId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStreams((prev) => prev.filter((s) => s._id !== streamId));
        if (activeStream?._id === streamId) {
          setActiveStream(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete stream:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[#E5E5E5] border-t-[#FF0000] rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]">Live Dashboard</h1>
          <p className="text-[#606060] mt-1">
            Create and manage your live streams
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-xl hover:bg-[#F2F2F2] transition-colors"
          >
            <MdRefresh className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-xl hover:bg-[#CC0000] transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            New Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isCreating ? (
            <div className="bg-white rounded-xl p-6 border border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#0F0F0F]">
                  Create New Stream
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-[#606060] hover:text-[#0F0F0F]"
                >
                  Cancel
                </button>
              </div>
              <LiveStreamSetup onStreamCreated={handleStreamCreated} />
            </div>
          ) : activeStream ? (
            <>
              {/* Preview */}
              <div className="bg-white rounded-xl p-6 border border-[#E5E5E5]">
                <h2 className="text-lg font-semibold text-[#0F0F0F] mb-4">
                  Stream Preview
                </h2>
                <LivePlayer
                  playbackUrl={activeStream.playbackUrl}
                  isLive={activeStream.isLive}
                  ended={activeStream.ended}
                  title={activeStream.title}
                  thumbnailUrl={activeStream.thumbnailUrl}
                />
                {activeStream.isLive && (
                  <div className="flex items-center justify-between mt-4 p-4 bg-[#F9F9F9] rounded-xl">
                    <div>
                      <p className="text-sm text-[#606060]">Current Viewers</p>
                      <p className="text-2xl font-bold text-[#0F0F0F]">
                        {formatViews(activeStream.viewers)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#606060]">Peak Viewers</p>
                      <p className="text-2xl font-bold text-[#0F0F0F]">
                        {formatViews(activeStream.peakViewers)}
                      </p>
                    </div>
                    <Link
                      href={`/live/${activeStream._id}`}
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-[#065FD4] text-white rounded-xl hover:bg-[#0056B3] transition-colors"
                    >
                      <MdOpenInNew className="w-5 h-5" />
                      View Live Page
                    </Link>
                  </div>
                )}
              </div>

              {/* Stream Settings */}
              <div className="bg-white rounded-xl p-6 border border-[#E5E5E5]">
                <h2 className="text-lg font-semibold text-[#0F0F0F] mb-4">
                  Stream Settings
                </h2>
                <StreamInfo
                  stream={activeStream}
                  onStartStream={handleStartStream}
                  onEndStream={handleEndStream}
                  isStarting={isStarting}
                  isEnding={isEnding}
                />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-[#E5E5E5] text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F2F2F2] flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#909090]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0F0F0F] mb-2">
                No active stream
              </h3>
              <p className="text-[#606060] mb-6">
                Create a new stream to start broadcasting
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-[#FF0000] text-white rounded-xl hover:bg-[#CC0000] transition-colors"
              >
                Create Stream
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Stream List */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E5E5E5]">
            <h2 className="text-lg font-semibold text-[#0F0F0F] mb-4">
              Your Streams
            </h2>
            {streams.length === 0 ? (
              <p className="text-[#606060] text-sm text-center py-4">
                No streams yet
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                {streams.map((stream) => (
                  <div
                    key={stream._id}
                    onClick={() => setActiveStream(stream)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      activeStream?._id === stream._id
                        ? 'bg-[#F2F2F2] border border-[#E5E5E5]'
                        : 'hover:bg-[#F9F9F9]'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-[#F2F2F2] flex-shrink-0">
                        {stream.thumbnailUrl ? (
                          <img
                            src={stream.thumbnailUrl}
                            alt={stream.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              LIVE
                            </span>
                          </div>
                        )}
                        {stream.isLive && !stream.ended && (
                          <span className="absolute top-1 left-1 px-1 py-0.5 bg-red-600 text-white text-[8px] font-semibold rounded">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#0F0F0F] truncate">
                          {stream.title}
                        </h4>
                        <p className="text-xs text-[#606060] mt-1">
                          {stream.ended
                            ? 'Ended'
                            : stream.isLive
                            ? `${formatViews(stream.viewers)} watching`
                            : 'Not started'}
                        </p>
                        <p className="text-xs text-[#909090]">
                          {formatTimeAgo(stream.createdAt)}
                        </p>
                      </div>
                      {stream.ended && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStream(stream._id);
                          }}
                          className="p-2 text-[#909090] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

