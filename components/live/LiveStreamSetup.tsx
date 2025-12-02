'use client';

import { useState, useRef } from 'react';
import { MdCloudUpload, MdContentCopy, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FiCheck } from 'react-icons/fi';

interface StreamData {
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

interface LiveStreamSetupProps {
  onStreamCreated: (stream: StreamData) => void;
}

const categories = [
  'Live',
  'Gaming',
  'Music',
  'Sports',
  'Education',
  'Entertainment',
  'Technology',
  'News',
  'Talk Show',
  'Podcast',
  'Other',
];

export default function LiveStreamSetup({ onStreamCreated }: LiveStreamSetupProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Live');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const res = await fetch('/api/live/create', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create stream');
      }

      const data = await res.json();
      onStreamCreated(data.stream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          Stream Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your stream title"
          maxLength={100}
          className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0000]/30 focus:border-[#FF0000]"
        />
        <p className="text-xs text-[#606060] mt-1">{title.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers about your stream"
          rows={4}
          maxLength={5000}
          className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0000]/30 focus:border-[#FF0000] resize-none"
        />
        <p className="text-xs text-[#606060] mt-1">{description.length}/5000</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0000]/30 focus:border-[#FF0000] bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          Thumbnail
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            thumbnailPreview
              ? 'border-green-500 bg-green-50'
              : 'border-[#E5E5E5] hover:border-[#FF0000] hover:bg-red-50'
          }`}
        >
          {thumbnailPreview ? (
            <div className="relative">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="max-h-40 mx-auto rounded-lg"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <>
              <MdCloudUpload className="w-12 h-12 text-[#909090] mx-auto mb-2" />
              <p className="text-sm text-[#606060]">
                Click to upload thumbnail
              </p>
              <p className="text-xs text-[#909090] mt-1">
                Recommended: 1280x720, max 5MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="w-full py-3 bg-[#FF0000] text-white font-medium rounded-xl hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Stream...
          </span>
        ) : (
          'Create Stream'
        )}
      </button>
    </form>
  );
}

// Stream Info Component for displaying after stream is created
interface StreamInfoProps {
  stream: {
    ingestUrl: string;
    streamKey: string;
    playbackUrl: string;
    isLive: boolean;
    ended: boolean;
  };
  onStartStream: () => void;
  onEndStream: () => void;
  isStarting: boolean;
  isEnding: boolean;
}

export function StreamInfo({
  stream,
  onStartStream,
  onEndStream,
  isStarting,
  isEnding,
}: StreamInfoProps) {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-3 p-4 bg-[#F9F9F9] rounded-xl">
        <div
          className={`w-3 h-3 rounded-full ${
            stream.isLive
              ? 'bg-red-500 animate-pulse'
              : stream.ended
              ? 'bg-gray-400'
              : 'bg-yellow-500'
          }`}
        />
        <span className="font-medium">
          {stream.isLive
            ? 'Live'
            : stream.ended
            ? 'Stream Ended'
            : 'Ready to Go Live'}
        </span>
      </div>

      {/* RTMP URL */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          RTMP Ingest URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={stream.ingestUrl}
            readOnly
            className="flex-1 px-4 py-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-sm font-mono"
          />
          <button
            onClick={() => copyToClipboard(stream.ingestUrl, 'ingestUrl')}
            className="px-4 py-2 bg-[#E5E5E5] hover:bg-[#D5D5D5] rounded-xl transition-colors"
          >
            {copiedField === 'ingestUrl' ? (
              <FiCheck className="w-5 h-5 text-green-500" />
            ) : (
              <MdContentCopy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Stream Key */}
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
          Stream Key
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showStreamKey ? 'text' : 'password'}
              value={stream.streamKey}
              readOnly
              className="w-full px-4 py-3 pr-12 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl text-sm font-mono"
            />
            <button
              onClick={() => setShowStreamKey(!showStreamKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] hover:text-[#0F0F0F]"
            >
              {showStreamKey ? (
                <MdVisibilityOff className="w-5 h-5" />
              ) : (
                <MdVisibility className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            onClick={() => copyToClipboard(stream.streamKey, 'streamKey')}
            className="px-4 py-2 bg-[#E5E5E5] hover:bg-[#D5D5D5] rounded-xl transition-colors"
          >
            {copiedField === 'streamKey' ? (
              <FiCheck className="w-5 h-5 text-green-500" />
            ) : (
              <MdContentCopy className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-[#909090] mt-2">
          ⚠️ Keep your stream key private. Don&apos;t share it with anyone.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!stream.isLive && !stream.ended && (
          <button
            onClick={onStartStream}
            disabled={isStarting}
            className="flex-1 py-3 bg-[#FF0000] text-white font-medium rounded-xl hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStarting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              '🔴 Go Live'
            )}
          </button>
        )}
        {stream.isLive && (
          <button
            onClick={onEndStream}
            disabled={isEnding}
            className="flex-1 py-3 bg-[#606060] text-white font-medium rounded-xl hover:bg-[#505050] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEnding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ending...
              </span>
            ) : (
              'End Stream'
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      {!stream.ended && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-800 mb-2">
            How to start streaming:
          </h4>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Open your streaming software (OBS, Streamlabs, etc.)</li>
            <li>Copy the RTMP URL and Stream Key above</li>
            <li>Paste them into your streaming software settings</li>
            <li>Start streaming in your software</li>
            <li>Click &quot;Go Live&quot; button above when ready</li>
          </ol>
        </div>
      )}
    </div>
  );
}

