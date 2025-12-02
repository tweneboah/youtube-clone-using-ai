'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  AiFillHome,
  AiOutlineHome,
  AiOutlineHistory,
  AiOutlineLike,
} from 'react-icons/ai';
import {
  MdOutlineSubscriptions,
  MdSubscriptions,
  MdOutlineVideoLibrary,
  MdOutlineWatchLater,
  MdPlaylistPlay,
  MdOutlineDownload,
  MdOutlineSettings,
} from 'react-icons/md';
import { SiYoutubeshorts } from 'react-icons/si';
import { FaYoutube, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { IoMusicalNotesOutline, IoGameControllerOutline, IoTrophyOutline } from 'react-icons/io5';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { BiMovie } from 'react-icons/bi';
import { RiLiveLine, RiYoutubeLine } from 'react-icons/ri';

interface Subscription {
  _id: string;
  name: string;
  avatar: string;
}

interface SidebarProps {
  subscriptions?: Subscription[];
  collapsed?: boolean;
}

const mainNavItems = [
  { icon: AiOutlineHome, activeIcon: AiFillHome, label: 'Home', href: '/' },
  { icon: SiYoutubeshorts, activeIcon: SiYoutubeshorts, label: 'Shorts', href: '/shorts' },
  { icon: MdOutlineSubscriptions, activeIcon: MdSubscriptions, label: 'Subscriptions', href: '/subscriptions' },
];

const youItems = [
  { icon: AiOutlineHistory, label: 'History', href: '/history' },
  { icon: MdPlaylistPlay, label: 'Playlists', href: '/playlists' },
  { icon: MdOutlineVideoLibrary, label: 'Your videos', href: '/your-videos' },
  { icon: MdOutlineWatchLater, label: 'Watch later', href: '/watch-later' },
  { icon: AiOutlineLike, label: 'Liked videos', href: '/liked' },
  { icon: MdOutlineDownload, label: 'Downloads', href: '/downloads' },
];

const exploreItems = [
  { icon: RiLiveLine, label: 'Live', href: '/explore/live' },
  { icon: IoMusicalNotesOutline, label: 'Music', href: '/explore/music' },
  { icon: IoGameControllerOutline, label: 'Gaming', href: '/explore/gaming' },
  { icon: HiOutlineNewspaper, label: 'News', href: '/explore/news' },
  { icon: IoTrophyOutline, label: 'Sports', href: '/explore/sports' },
  { icon: BiMovie, label: 'Movies', href: '/explore/movies' },
];

const moreFromYouTubeItems = [
  { icon: FaYoutube, label: 'YouTube Premium', href: '/premium', color: '#FF0000' },
  { icon: RiYoutubeLine, label: 'YouTube Studio', href: '/studio', color: '#FF0000' },
  { icon: IoMusicalNotesOutline, label: 'YouTube Music', href: '/music', color: '#FF0000' },
  { icon: FaYoutube, label: 'YouTube Kids', href: '/kids', color: '#FF0000' },
];

export default function Sidebar({ subscriptions = [], collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [youExpanded, setYouExpanded] = useState(true);
  const [subscriptionsExpanded, setSubscriptionsExpanded] = useState(true);
  const [exploreExpanded, setExploreExpanded] = useState(true);
  const [moreExpanded, setMoreExpanded] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-[72px] h-[calc(100vh-56px)] sticky top-[56px] flex flex-col items-center py-1 overflow-y-auto scrollbar-hide bg-white">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 px-1 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors ${
                isActive ? 'bg-[#F2F2F2]' : ''
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-[#0F0F0F]' : 'text-[#0F0F0F]'}`} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/library"
          className="flex flex-col items-center justify-center gap-1.5 py-4 px-1 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors"
        >
          <MdOutlineVideoLibrary className="w-6 h-6 text-[#0F0F0F]" />
          <span className="text-[10px] leading-tight">You</span>
        </Link>
      </aside>
    );
  }

  return (
    <aside className="w-[240px] h-[calc(100vh-56px)] sticky top-[56px] overflow-y-auto scrollbar-thin bg-white pl-3 pr-3 pb-4">
      {/* Main Navigation */}
      <nav className="py-3 border-b border-[#E5E5E5]">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-6 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#F2F2F2] font-medium'
                  : 'hover:bg-[#F2F2F2]'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* You Section */}
      <div className="py-3 border-b border-[#E5E5E5]">
        <button
          onClick={() => setYouExpanded(!youExpanded)}
          className="flex items-center gap-1 px-3 py-2.5 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors"
        >
          <span className="text-base font-medium">You</span>
          {youExpanded ? (
            <FaChevronDown className="w-3.5 h-3.5 ml-1" />
          ) : (
            <FaChevronRight className="w-3.5 h-3.5 ml-1" />
          )}
        </button>
        {youExpanded && (
          <nav className="mt-1">
            {youItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-6 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#F2F2F2] font-medium'
                      : 'hover:bg-[#F2F2F2]'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Subscriptions Section */}
      <div className="py-3 border-b border-[#E5E5E5]">
        <button
          onClick={() => setSubscriptionsExpanded(!subscriptionsExpanded)}
          className="flex items-center justify-between px-3 py-2.5 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors"
        >
          <span className="text-base font-medium">Subscriptions</span>
          {subscriptionsExpanded ? (
            <FaChevronDown className="w-3.5 h-3.5" />
          ) : (
            <FaChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {subscriptionsExpanded && (
          <div className="mt-1">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/channel/${sub._id}`}
                  className="flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#F2F2F2] transition-colors"
                >
                  {sub.avatar ? (
                    <img
                      src={sub.avatar}
                      alt={sub.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#EF6C00] flex items-center justify-center text-white text-[10px] font-medium">
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm truncate">{sub.name}</span>
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-[#606060]">
                No subscriptions yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Explore Section */}
      <div className="py-3 border-b border-[#E5E5E5]">
        <button
          onClick={() => setExploreExpanded(!exploreExpanded)}
          className="flex items-center justify-between px-3 py-2.5 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors"
        >
          <span className="text-base font-medium">Explore</span>
          {exploreExpanded ? (
            <FaChevronDown className="w-3.5 h-3.5" />
          ) : (
            <FaChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {exploreExpanded && (
          <nav className="mt-1">
            {exploreItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-6 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#F2F2F2] font-medium'
                      : 'hover:bg-[#F2F2F2]'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* More from YouTube */}
      <div className="py-3 border-b border-[#E5E5E5]">
        <button
          onClick={() => setMoreExpanded(!moreExpanded)}
          className="flex items-center justify-between px-3 py-2.5 w-full hover:bg-[#F2F2F2] rounded-xl transition-colors"
        >
          <span className="text-base font-medium">More from YouTube</span>
          {moreExpanded ? (
            <FaChevronDown className="w-3.5 h-3.5" />
          ) : (
            <FaChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {moreExpanded && (
          <nav className="mt-1">
            {moreFromYouTubeItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#F2F2F2] transition-colors"
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Settings */}
      <div className="py-3 border-b border-[#E5E5E5]">
        <Link
          href="/settings"
          className="flex items-center gap-6 px-3 py-2.5 rounded-xl hover:bg-[#F2F2F2] transition-colors"
        >
          <MdOutlineSettings className="w-6 h-6" />
          <span className="text-sm">Settings</span>
        </Link>
      </div>

      {/* Footer Links */}
      <div className="py-4 px-3">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060]">
          <Link href="#" className="hover:text-[#0F0F0F]">About</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Press</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Copyright</Link>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060] mt-1">
          <Link href="#" className="hover:text-[#0F0F0F]">Contact us</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Creators</Link>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060] mt-1">
          <Link href="#" className="hover:text-[#0F0F0F]">Advertise</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Developers</Link>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060] mt-3">
          <Link href="#" className="hover:text-[#0F0F0F]">Terms</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Privacy</Link>
          <Link href="#" className="hover:text-[#0F0F0F]">Policy & Safety</Link>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060] mt-1">
          <Link href="#" className="hover:text-[#0F0F0F]">How YouTube works</Link>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] text-[#606060] mt-1">
          <Link href="#" className="hover:text-[#0F0F0F]">Test new features</Link>
        </div>
        <p className="text-xs text-[#909090] mt-4">© 2024 Google LLC</p>
      </div>
    </aside>
  );
}
