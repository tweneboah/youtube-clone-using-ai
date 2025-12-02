'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  IoSearch,
  IoNotificationsOutline,
  IoLogOutOutline,
  IoMicOutline,
  IoClose,
} from 'react-icons/io5';
import { HiOutlineVideoCamera, HiOutlineMenuAlt2 } from 'react-icons/hi';
import { FaYoutube, FaPlus } from 'react-icons/fa';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { RiVideoAddLine, RiLiveLine } from 'react-icons/ri';
import { SiYoutubeshorts } from 'react-icons/si';

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface TopbarProps {
  user?: User | null;
  onToggleSidebar?: () => void;
}

export default function Topbar({ user, onToggleSidebar }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const displayName = user?.name || session?.user?.name || 'Guest';
  const userAvatar = user?.avatar || session?.user?.image;
  const isLoggedIn = !!session;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white sticky top-0 z-50">
      {/* Left Section - Menu & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenuAlt2 className="w-6 h-6 text-[#030303]" />
        </button>
        <Link href="/" className="flex items-center gap-0.5">
          <FaYoutube className="w-[90px] h-5 text-[#FF0000]" />
          <span className="text-[10px] text-[#606060] align-super -ml-1 -mt-2">GH</span>
        </Link>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-[640px] mx-4">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="flex flex-1 h-10 border border-[#D3D3D3] rounded-l-full focus-within:border-[#1C62B9] focus-within:shadow-inner">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-full pl-4 pr-2 bg-transparent text-base text-[#111111] placeholder-[#888888] focus:outline-none rounded-l-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2 hover:bg-[#F2F2F2] rounded-full"
              >
                <IoClose className="w-5 h-5 text-[#606060]" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-16 h-10 flex items-center justify-center bg-[#F8F8F8] border border-l-0 border-[#D3D3D3] rounded-r-full hover:bg-[#F0F0F0] transition-colors"
          >
            <IoSearch className="w-5 h-5 text-[#030303]" />
          </button>
        </form>
        <button className="ml-2 w-10 h-10 flex items-center justify-center bg-[#F2F2F2] rounded-full hover:bg-[#E5E5E5] transition-colors">
          <IoMicOutline className="w-5 h-5 text-[#030303]" />
        </button>
      </div>

      {/* Mobile Search Button */}
      <button
        onClick={() => setShowMobileSearch(true)}
        className="md:hidden p-2 hover:bg-[#F2F2F2] rounded-full transition-colors"
      >
        <IoSearch className="w-6 h-6 text-[#030303]" />
      </button>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        {isLoggedIn ? (
          <>
            {/* Create Button */}
            <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 h-9 px-3 hover:bg-[#F2F2F2] rounded-full transition-colors"
              >
                <FaPlus className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Create</span>
              </button>
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-50">
                  <Link
                    href="/upload"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F2F2F2] text-sm"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <RiVideoAddLine className="w-5 h-5" />
                    Upload video
                  </Link>
                  <Link
                    href="/upload/short"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F2F2F2] text-sm"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <SiYoutubeshorts className="w-5 h-5 text-[#FF0000]" />
                    Create Short
                  </Link>
                  <Link
                    href="/studio/live"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F2F2F2] text-sm"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <RiLiveLine className="w-5 h-5" />
                    Go live
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
              <IoNotificationsOutline className="w-6 h-6 text-[#030303]" />
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[#FF0000] text-white text-[11px] font-medium rounded-full px-1">
                9+
              </span>
            </button>

            {/* Profile Menu */}
            <div className="relative ml-1" ref={profileMenuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="focus:outline-none"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-sm font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E5E5E5] py-2 z-50">
                  <div className="flex items-center gap-4 px-4 py-3 border-b border-[#E5E5E5]">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center text-white font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-base">{displayName}</p>
                      <Link
                        href={user?._id ? `/channel/${user._id}` : '#'}
                        className="text-sm text-[#065FD4] hover:text-[#065FD4]/80"
                        onClick={() => setShowMenu(false)}
                      >
                        View your channel
                      </Link>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-4 px-4 py-2.5 w-full hover:bg-[#F2F2F2] text-sm"
                    >
                      <IoLogOutOutline className="w-5 h-5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 border border-[#D3D3D3] rounded-full text-[#065FD4] hover:bg-[#DEF1FF] transition-colors"
          >
            <MdOutlineAccountCircle className="w-6 h-6" />
            <span className="text-sm font-medium">Sign in</span>
          </Link>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-50 flex items-center px-2 md:hidden">
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-2 mr-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <form onSubmit={handleSearch} className="flex flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search YouTube"
              autoFocus
              className="flex-1 h-10 px-4 bg-[#F8F8F8] rounded-full text-base focus:outline-none"
            />
          </form>
          <button className="p-2 ml-2">
            <IoMicOutline className="w-6 h-6" />
          </button>
        </div>
      )}
    </header>
  );
}
