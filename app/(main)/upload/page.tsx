'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IoCloudUpload, IoClose } from 'react-icons/io5';
import { categories } from '@/lib/utils';

export default function UploadPage() {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
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

    if (!title || !category) {
      setError('Please fill in all required fields');
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

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { videoUrl, thumbnailUrl, duration } = await uploadRes.json();
      setUploadProgress(70);

      // Step 2: Create video record in database
      const videoRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnail: thumbnailUrl,
          duration,
          category,
        }),
      });

      if (!videoRes.ok) {
        const data = await videoRes.json();
        throw new Error(data.error || 'Failed to create video');
      }

      setUploadProgress(100);

      const { video } = await videoRes.json();
      router.push(`/watch/${video._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">Upload Video</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-2">
            Video <span className="text-[#FF0000]">*</span>
          </label>
          {!videoPreview ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-[#ECECEC] rounded-xl p-8 text-center cursor-pointer hover:border-[#FF0000]/50 transition-colors"
            >
              <IoCloudUpload className="w-12 h-12 mx-auto text-[#999999] mb-3" />
              <p className="text-sm text-[#555555] mb-1">Click to upload video</p>
              <p className="text-xs text-[#999999]">MP4, WebM, MOV up to 500MB</p>
            </div>
          ) : (
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video src={videoPreview} controls className="w-full h-full" />
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview('');
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
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

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-2">
            Thumbnail (Optional)
          </label>
          {!thumbnailPreview ? (
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-[#ECECEC] rounded-xl p-6 text-center cursor-pointer hover:border-[#FF0000]/50 transition-colors"
            >
              <p className="text-sm text-[#555555]">Click to upload thumbnail</p>
              <p className="text-xs text-[#999999] mt-1">PNG, JPG up to 5MB</p>
            </div>
          ) : (
            <div className="relative w-64 aspect-video bg-[#ECECEC] rounded-xl overflow-hidden">
              <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
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
            placeholder="Enter video title"
            maxLength={100}
          />
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
            placeholder="Tell viewers about your video"
            rows={4}
            maxLength={5000}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#111111] mb-2">
            Category <span className="text-[#FF0000]">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-4 bg-[#F6F6F6] rounded-xl text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
        <button
          type="submit"
          disabled={uploading}
          className="w-full h-12 bg-[#FF0000] text-white font-medium rounded-xl hover:bg-[#CC0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}

