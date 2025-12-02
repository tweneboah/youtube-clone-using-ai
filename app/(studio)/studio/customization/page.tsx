'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdOutlineHelp } from 'react-icons/md';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  banner: string;
  description: string;
  customUrl?: string;
  subscribers: number;
}

type TabType = 'profile' | 'home';

export default function CustomizationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customUrl: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setFormData({
            name: data.user.name,
            description: data.user.description || '',
            customUrl: data.user.customUrl?.replace('@', '') || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (type: 'avatar' | 'banner', file: File) => {
    const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBanner;
    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', type);

      const res = await fetch('/api/users/profile/image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        showMessage('success', `${type === 'avatar' ? 'Picture' : 'Banner'} updated`);
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Failed to upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = async (type: 'avatar' | 'banner') => {
    try {
      const res = await fetch(`/api/users/profile/image?type=${type}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        showMessage('success', `${type === 'avatar' ? 'Picture' : 'Banner'} removed`);
      }
    } catch (error) {
      console.error('Remove error:', error);
      showMessage('error', 'Failed to remove');
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      if (formData.name !== profile?.name) updates.name = formData.name;
      if (formData.description !== (profile?.description || ''))
        updates.description = formData.description;
      if (formData.customUrl !== (profile?.customUrl?.replace('@', '') || ''))
        updates.customUrl = formData.customUrl;

      if (Object.keys(updates).length === 0) {
        showMessage('success', 'No changes to save');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setHasChanges(false);
        showMessage('success', 'Changes published');
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        description: profile.description || '',
        customUrl: profile.customUrl?.replace('@', '') || '',
      });
      setHasChanges(false);
    }
  };

  const handleFileChange = (type: 'avatar' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(type, file);
    }
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-[#E5E5E5] rounded" />
        <div className="h-12 w-full max-w-md bg-[#E5E5E5] rounded" />
        <div className="space-y-4">
          <div className="h-32 bg-[#E5E5E5] rounded-xl" />
          <div className="h-32 bg-[#E5E5E5] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            message.type === 'success' ? 'bg-[#2E7D32]' : 'bg-[#D32F2F]'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[#0F0F0F]">Channel customization</h1>
        <div className="flex items-center gap-2">
          <Link
            href={profile ? `/channel/${profile._id}` : '#'}
            className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors"
          >
            View channel
          </Link>
          <button
            onClick={handleCancel}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-[#606060] bg-[#F2F2F2] rounded-sm hover:bg-[#E5E5E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E5E5] mb-6">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'text-[#0F0F0F] border-[#0F0F0F]'
                : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'home'
                ? 'text-[#0F0F0F] border-[#0F0F0F]'
                : 'text-[#606060] border-transparent hover:text-[#0F0F0F]'
            }`}
          >
            Home tab
          </button>
        </div>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          {/* Banner Image */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Banner image</h2>
            <p className="text-xs text-[#606060] mb-4">
              This image will appear across the top of your channel
            </p>
            <div className="flex gap-8">
              {/* Banner Preview */}
              <div className="w-[290px] h-[160px] bg-[#F2F2F2] rounded-sm overflow-hidden flex-shrink-0">
                {profile?.banner ? (
                  <img
                    src={profile.banner}
                    alt="Channel banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#3EA6FF] via-[#0D47A1] to-[#3EA6FF]">
                    <div className="text-center text-white/60">
                      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Actions */}
              <div>
                <p className="text-xs text-[#606060] mb-3">
                  For the best results on all devices, use an image that&apos;s at least 2048 x 1152 pixels and 6MB or less.{' '}
                  <button className="inline-flex items-center">
                    <MdOutlineHelp className="w-4 h-4 text-[#606060]" />
                  </button>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
                  >
                    {uploadingBanner ? 'Uploading...' : 'Change'}
                  </button>
                  {profile?.banner && (
                    <button
                      onClick={() => handleImageRemove('banner')}
                      className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange('banner')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Picture</h2>
            <p className="text-xs text-[#606060] mb-4">
              Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments
            </p>
            <div className="flex gap-8">
              {/* Avatar Preview */}
              <div className="w-[160px] h-[160px] rounded-full overflow-hidden flex-shrink-0 bg-[#F2F2F2]">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#EF6C00] text-white text-5xl font-medium">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Avatar Actions */}
              <div>
                <p className="text-xs text-[#606060] mb-3">
                  It&apos;s recommended to use a picture that&apos;s at least 98 x 98 pixels and 4MB or less. Use a PNG or GIF (no animations) file. Make sure your picture follows the YouTube Community Guidelines.{' '}
                  <button className="inline-flex items-center">
                    <MdOutlineHelp className="w-4 h-4 text-[#606060]" />
                  </button>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Change'}
                  </button>
                  {profile?.avatar && (
                    <button
                      onClick={() => handleImageRemove('avatar')}
                      className="px-4 py-2 text-sm font-medium text-[#0F0F0F] border border-[#CCCCCC] rounded-sm hover:bg-[#F2F2F2] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange('avatar')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Name</h2>
            <p className="text-xs text-[#606060] mb-3">
              Choose a channel name that represents you and your content. Changes made to your name and picture are visible only on YouTube and not other Google services. You can change your name twice in 14 days.{' '}
              <button className="inline-flex items-center">
                <MdOutlineHelp className="w-4 h-4 text-[#606060]" />
              </button>
            </p>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full max-w-xl px-4 py-3 border border-[#CCCCCC] rounded-sm text-sm focus:outline-none focus:border-[#1A73E8]"
              maxLength={50}
            />
          </div>

          {/* Handle */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Handle</h2>
            <p className="text-xs text-[#606060] mb-3">
              Choose your unique handle by adding letters and numbers. You can change your handle back within 14 days. Handles can be changed twice every 14 days.{' '}
              <button className="inline-flex items-center">
                <MdOutlineHelp className="w-4 h-4 text-[#606060]" />
              </button>
            </p>
            <div className="flex items-center max-w-xl">
              <span className="px-4 py-3 bg-[#F2F2F2] border border-r-0 border-[#CCCCCC] rounded-l-sm text-sm text-[#606060]">
                @
              </span>
              <input
                type="text"
                value={formData.customUrl}
                onChange={(e) => handleInputChange('customUrl', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                placeholder="your-handle"
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-r-sm text-sm focus:outline-none focus:border-[#1A73E8]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Description</h2>
            <p className="text-xs text-[#606060] mb-3">
              Tell viewers about your channel
            </p>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full max-w-xl px-4 py-3 border border-[#CCCCCC] rounded-sm text-sm focus:outline-none focus:border-[#1A73E8] resize-none"
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-[#606060] mt-1 text-right max-w-xl">
              {formData.description.length}/1000
            </p>
          </div>

          {/* Channel URL */}
          <div>
            <h2 className="text-sm font-medium text-[#0F0F0F] mb-1">Channel URL</h2>
            <p className="text-xs text-[#606060] mb-3">
              This is the standard web address for your channel. It includes your unique channel ID.
            </p>
            <div className="px-4 py-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-sm text-sm text-[#606060] max-w-xl">
              {typeof window !== 'undefined' ? window.location.origin : ''}/channel/{profile?._id}
            </div>
          </div>
        </div>
      )}

      {/* Home Tab Content */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="text-center py-12 bg-[#F9F9F9] rounded-xl">
            <svg className="w-16 h-16 mx-auto text-[#909090] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-[#0F0F0F] mb-2">
              Customize your channel home tab
            </h3>
            <p className="text-sm text-[#606060] max-w-md mx-auto">
              Add featured sections to showcase your best content to visitors. You can feature videos, playlists, and more.
            </p>
            <p className="text-xs text-[#909090] mt-4">
              This feature is coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


