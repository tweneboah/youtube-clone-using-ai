'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCamera, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { IoImageOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle, MdOutlineImage } from 'react-icons/md';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  banner: string;
  description: string;
  customUrl?: string;
  subscribers: number;
  verified: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingCustomUrl, setEditingCustomUrl] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customUrl: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
            customUrl: data.user.customUrl || '',
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

  const handleImageUpload = async (type: 'avatar' | 'banner', file: File) => {
    const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBanner;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/users/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        showMessage('success', `${type === 'avatar' ? 'Profile picture' : 'Banner'} updated successfully`);
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Failed to upload image');
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
        showMessage('success', `${type === 'avatar' ? 'Profile picture' : 'Banner'} removed`);
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Failed to remove image');
      }
    } catch (error) {
      console.error('Remove error:', error);
      showMessage('error', 'Failed to remove image');
    }
  };

  const handleSaveField = async (field: 'name' | 'description' | 'customUrl') => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: formData[field] }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setFormData((prev) => ({ ...prev, [field]: data.user[field] || '' }));
        showMessage('success', 'Changes saved successfully');
        
        if (field === 'name') setEditingName(false);
        if (field === 'description') setEditingDescription(false);
        if (field === 'customUrl') setEditingCustomUrl(false);
      } else {
        const error = await res.json();
        showMessage('error', error.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (type: 'avatar' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(type, file);
    }
    e.target.value = '';
  };

  if (loading || status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-[#E5E5E5] rounded" />
          <div className="h-[200px] bg-[#E5E5E5] rounded-xl" />
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-[#E5E5E5] rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-48 bg-[#E5E5E5] rounded" />
              <div className="h-4 w-32 bg-[#E5E5E5] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-[#606060]">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0F0F0F]">Channel customization</h1>
        <Link
          href={`/channel/${profile._id}`}
          className="px-4 py-2 text-sm font-medium text-[#065FD4] hover:bg-[#def1ff] rounded-full transition-colors"
        >
          View channel
        </Link>
      </div>

      {/* Banner Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">Banner image</h2>
        <p className="text-sm text-[#606060] mb-4">
          This image will appear across the top of your channel
        </p>
        <div className="relative group">
          <div
            className={`relative h-[200px] rounded-xl overflow-hidden ${
              profile.banner ? '' : 'bg-gradient-to-r from-[#3EA6FF] via-[#0D47A1] to-[#3EA6FF]'
            }`}
          >
            {profile.banner ? (
              <img
                src={profile.banner}
                alt="Channel banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoImageOutline className="w-16 h-16 text-white/60" />
              </div>
            )}

            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0F0F0F] rounded-full text-sm font-medium hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
              >
                <FiCamera className="w-4 h-4" />
                {uploadingBanner ? 'Uploading...' : profile.banner ? 'Change' : 'Upload'}
              </button>
              {profile.banner && (
                <button
                  onClick={() => handleImageRemove('banner')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#0F0F0F] rounded-full text-sm font-medium hover:bg-[#F2F2F2] transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange('banner')}
            className="hidden"
          />
        </div>
        <p className="text-xs text-[#606060] mt-2">
          For the best results, use an image at least 2048x1152 pixels and 6MB or less.
        </p>
      </div>

      {/* Profile Picture Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[#0F0F0F] mb-4">Picture</h2>
        <p className="text-sm text-[#606060] mb-4">
          Your profile picture will appear where your channel is presented
        </p>
        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#F2F2F2]">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EF6C00] text-white text-4xl font-medium">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="p-3 bg-white rounded-full hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
              >
                <FiCamera className="w-5 h-5 text-[#0F0F0F]" />
              </button>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange('avatar')}
              className="hidden"
            />
          </div>

          <div className="flex-1 pt-2">
            <p className="text-sm text-[#606060] mb-3">
              It&apos;s recommended to use a picture that&apos;s at least 98x98 pixels and 4MB or less.
              Use a PNG or GIF (no animations) file.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 text-sm font-medium text-[#065FD4] hover:bg-[#def1ff] rounded-full transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? 'Uploading...' : 'Change'}
              </button>
              {profile.avatar && (
                <button
                  onClick={() => handleImageRemove('avatar')}
                  className="px-4 py-2 text-sm font-medium text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-[#0F0F0F]">Basic info</h2>

        {/* Name */}
        <div className="p-4 border border-[#E5E5E5] rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0F0F0F] mb-1">Name</label>
              <p className="text-xs text-[#606060] mb-2">
                Choose a channel name that represents you and your content.
              </p>
              {editingName ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#065FD4]"
                  maxLength={50}
                  autoFocus
                />
              ) : (
                <p className="text-[#0F0F0F]">{profile.name}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {editingName ? (
                <>
                  <button
                    onClick={() => handleSaveField('name')}
                    disabled={saving || !formData.name.trim()}
                    className="p-2 text-[#065FD4] hover:bg-[#def1ff] rounded-full transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setFormData((prev) => ({ ...prev, name: profile.name }));
                    }}
                    className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Handle / Custom URL */}
        <div className="p-4 border border-[#E5E5E5] rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0F0F0F] mb-1">Handle</label>
              <p className="text-xs text-[#606060] mb-2">
                Choose your unique handle by adding letters and numbers.
              </p>
              {editingCustomUrl ? (
                <div className="flex items-center gap-1">
                  <span className="text-[#606060]">@</span>
                  <input
                    type="text"
                    value={formData.customUrl.replace('@', '')}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customUrl: e.target.value.replace('@', '') }))}
                    className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#065FD4]"
                    placeholder="your-handle"
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-[#0F0F0F]">{profile.customUrl || 'Not set'}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {editingCustomUrl ? (
                <>
                  <button
                    onClick={() => handleSaveField('customUrl')}
                    disabled={saving}
                    className="p-2 text-[#065FD4] hover:bg-[#def1ff] rounded-full transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCustomUrl(false);
                      setFormData((prev) => ({ ...prev, customUrl: profile.customUrl || '' }));
                    }}
                    className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingCustomUrl(true)}
                  className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 border border-[#E5E5E5] rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0F0F0F] mb-1">Description</label>
              <p className="text-xs text-[#606060] mb-2">
                Tell viewers about your channel. Your description will appear in the About section of your channel.
              </p>
              {editingDescription ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#0F0F0F] focus:outline-none focus:border-[#065FD4] resize-none"
                  rows={4}
                  maxLength={1000}
                  autoFocus
                />
              ) : (
                <p className="text-[#0F0F0F] whitespace-pre-wrap">
                  {profile.description || 'No description'}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {editingDescription ? (
                <>
                  <button
                    onClick={() => handleSaveField('description')}
                    disabled={saving}
                    className="p-2 text-[#065FD4] hover:bg-[#def1ff] rounded-full transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setFormData((prev) => ({ ...prev, description: profile.description || '' }));
                    }}
                    className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="p-2 text-[#606060] hover:bg-[#F2F2F2] rounded-full transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel URL Info */}
      <div className="mt-8 p-4 bg-[#F9F9F9] rounded-lg">
        <h3 className="text-sm font-medium text-[#0F0F0F] mb-2">Channel URL</h3>
        <p className="text-sm text-[#606060] mb-2">
          This is the standard web address for your channel.
        </p>
        <code className="text-sm text-[#065FD4] bg-[#E8F0FE] px-2 py-1 rounded">
          {typeof window !== 'undefined' ? window.location.origin : ''}/channel/{profile._id}
        </code>
      </div>
    </div>
  );
}







