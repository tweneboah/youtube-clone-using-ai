'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { IoCloudUpload, IoClose, IoMusicalNotes } from 'react-icons/io5';
import { SiYoutubeshorts } from 'react-icons/si';

export default function UploadShortPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [soundName, setSoundName] = useState('');
  const [hashtags, setHashtags] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'vertical' | 'horizontal' | 'square' | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError('');

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video must be less than 100MB');
        return;
      }

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleVideoLoad = () => {
    const video = videoPreviewRef.current;
    if (video) {
      setVideoDuration(video.duration);

      // Check duration (max 60 seconds)
      if (video.duration > 60) {
        setError('Shorts must be 60 seconds or less');
        setVideoFile(null);
        setVideoPreview('');
        return;
      }

      // Check aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      if (aspectRatio > 1) {
        setVideoAspectRatio('horizontal');
        setError('Shorts must be vertical (9:16 aspect ratio). Please upload a vertical video.');
        setVideoFile(null);
        setVideoPreview('');
        return;
      } else if (aspectRatio === 1) {
        setVideoAspectRatio('square');
      } else {
        setVideoAspectRatio('vertical');
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (videoDuration > 60) {
      setError('Shorts must be 60 seconds or less');
      return;
    }

    if (videoAspectRatio === 'horizontal') {
      setError('Shorts must be vertical (9:16 aspect ratio)');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Upload video and thumbnail to Cloudinary
      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      setUploadProgress(30);

      const uploadRes = await fetch('/api/shorts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { videoUrl, thumbnailUrl, duration } = await uploadRes.json();
      setUploadProgress(70);

      // Parse hashtags
      const hashtagArray = hashtags
        .split(/[,\s#]+/)
        .filter(tag => tag.trim().length > 0)
        .map(tag => tag.trim());

      // Step 2: Create short record in database
      const shortRes = await fetch('/api/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          videoUrl,
          thumbnailUrl,
          duration,
          soundName: soundName.trim() || undefined,
          hashtags: hashtagArray,
        }),
      });

      if (!shortRes.ok) {
        const data = await shortRes.json();
        throw new Error(data.error || 'Failed to create short');
      }

      setUploadProgress(100);

      const { short } = await shortRes.json();
      router.push(`/shorts/${short._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#FF0000] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[20px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <SiYoutubeshorts className="w-8 h-8 text-[#FF0000]" />
          <h1 className="text-2xl font-semibold text-[#111111]">Create Short</h1>
        </div>

        {/* Info Banner */}
        <div className="bg-[#F8F8F8] rounded-xl p-4 mb-6">
          <h3 className="font-medium text-[#111111] mb-2">Short Requirements:</h3>
          <ul className="text-sm text-[#606060] space-y-1">
            <li>• Video must be vertical (9:16 aspect ratio)</li>
            <li>• Maximum duration: 60 seconds</li>
            <li>• Maximum file size: 100MB</li>
          </ul>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Video Upload */}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">
                Video <span className="text-[#FF0000]">*</span>
              </label>
              {!videoPreview ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#ECECEC] rounded-xl p-8 text-center cursor-pointer hover:border-[#FF0000]/50 transition-colors aspect-[9/16] flex flex-col items-center justify-center"
                >
                  <IoCloudUpload className="w-12 h-12 text-[#999999] mb-3" />
                  <p className="text-sm text-[#555555] mb-1">Click to upload vertical video</p>
                  <p className="text-xs text-[#999999]">9:16 aspect ratio • Max 60 seconds</p>
                </div>
              ) : (
                <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreview}
                    controls
                    className="w-full h-full object-contain"
                    onLoadedMetadata={handleVideoLoad}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                      setVideoDuration(0);
                      setVideoAspectRatio(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                  {videoAspectRatio === 'vertical' && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {Math.round(videoDuration)}s
                    </div>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#111111] mb-2">
                  Title <span className="text-[#FF0000]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                  placeholder="Add a catchy title"
                  maxLength={100}
                />
                <p className="text-xs text-[#999999] mt-1">{title.length}/100</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#111111] mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] resize-none focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                  placeholder="Tell viewers about your Short"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-[#999999] mt-1">{description.length}/500</p>
              </div>

              {/* Sound Name */}
              <div>
                <label htmlFor="soundName" className="block text-sm font-medium text-[#111111] mb-2">
                  <span className="flex items-center gap-2">
                    <IoMusicalNotes className="w-4 h-4" />
                    Sound Name
                  </span>
                </label>
                <input
                  type="text"
                  id="soundName"
                  value={soundName}
                  onChange={(e) => setSoundName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                  placeholder="Original sound - Your name"
                  maxLength={100}
                />
              </div>

              {/* Hashtags */}
              <div>
                <label htmlFor="hashtags" className="block text-sm font-medium text-[#111111] mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  id="hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F6F6F6] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
                  placeholder="#shorts #viral #trending"
                />
                <p className="text-xs text-[#999999] mt-1">Separate hashtags with spaces or commas</p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Custom Thumbnail (Optional)
                </label>
                {!thumbnailPreview ? (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="border-2 border-dashed border-[#ECECEC] rounded-xl p-4 text-center cursor-pointer hover:border-[#FF0000]/50 transition-colors"
                  >
                    <p className="text-sm text-[#555555]">Click to upload thumbnail</p>
                    <p className="text-xs text-[#999999] mt-1">PNG, JPG (auto-generated if not uploaded)</p>
                  </div>
                ) : (
                  <div className="relative w-32 aspect-[9/16] bg-[#ECECEC] rounded-xl overflow-hidden">
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview('');
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <IoClose className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div className="h-2 bg-[#ECECEC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF0000] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-[#555555] mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-[#606060] font-medium rounded-full hover:bg-[#F2F2F2] transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !videoFile || !title.trim()}
              className="px-8 py-3 bg-[#FF0000] text-white font-medium rounded-full hover:bg-[#CC0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SiYoutubeshorts className="w-5 h-5" />
              {uploading ? 'Creating Short...' : 'Create Short'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

