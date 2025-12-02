'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaYoutube } from 'react-icons/fa';
import { RxHamburgerMenu } from 'react-icons/rx';
import {
  MdOutlineDashboard,
  MdOutlineVideoLibrary,
  MdOutlineAnalytics,
  MdOutlinePeopleAlt,
  MdOutlineLanguage,
  MdOutlineSecurity,
  MdOutlineAttachMoney,
  MdOutlineBrush,
  MdOutlineMusicNote,
  MdOutlineSettings,
  MdOutlineFeedback,
  MdOutlineSearch,
  MdOutlineNotifications,
  MdOutlineHelp,
  MdAdd,
} from 'react-icons/md';

interface UserProfile {
  _id: string;
  name: string;
  avatar: string;
}

import { RiLiveLine } from 'react-icons/ri';

const sidebarItems = [
  { icon: MdOutlineDashboard, label: 'Dashboard', href: '/studio' },
  { icon: MdOutlineVideoLibrary, label: 'Content', href: '/studio/content' },
  { icon: RiLiveLine, label: 'Live', href: '/studio/live' },
  { icon: MdOutlineAnalytics, label: 'Analytics', href: '/studio/analytics' },
  { icon: MdOutlinePeopleAlt, label: 'Community', href: '/studio/community' },
  { icon: MdOutlineLanguage, label: 'Languages', href: '/studio/languages' },
  { icon: MdOutlineSecurity, label: 'Content detection', href: '/studio/detection' },
  { icon: MdOutlineAttachMoney, label: 'Earn', href: '/studio/earn' },
  { icon: MdOutlineBrush, label: 'Customization', href: '/studio/customization' },
  { icon: MdOutlineMusicNote, label: 'Creator Music [Beta]', href: '/studio/music' },
];

const bottomItems = [
  { icon: MdOutlineSettings, label: 'Settings', href: '/studio/settings' },
  { icon: MdOutlineFeedback, label: 'Send feedback', href: '/studio/feedback' },
];

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF0000] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors"
          >
            <RxHamburgerMenu className="w-5 h-5" />
          </button>
          <Link href="/studio" className="flex items-center gap-1">
            <FaYoutube className="w-8 h-8 text-[#FF0000]" />
            <span className="text-xl font-semibold text-[#606060]">Studio</span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <MdOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
            <input
              type="text"
              placeholder="Search across your channel"
              className="w-full pl-10 pr-4 py-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded-full text-sm focus:outline-none focus:border-[#1A73E8] focus:bg-white"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdOutlineHelp className="w-6 h-6 text-[#606060]" />
          </button>
          <button className="p-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdOutlineNotifications className="w-6 h-6 text-[#606060]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#F2F2F2] rounded-full transition-colors">
            <MdAdd className="w-5 h-5" />
            <span className="text-sm font-medium">Create</span>
          </button>
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#EF6C00] flex items-center justify-center text-white text-sm font-medium">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-white border-r border-[#E5E5E5] transition-all duration-200 z-40 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        <div className="flex flex-col h-full py-4 overflow-y-auto">
          {/* Channel Info */}
          <div className={`px-4 mb-4 ${sidebarCollapsed ? 'text-center' : ''}`}>
            <Link href={profile ? `/channel/${profile._id}` : '#'}>
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className={`rounded-full object-cover mx-auto ${
                    sidebarCollapsed ? 'w-10 h-10' : 'w-[88px] h-[88px]'
                  }`}
                />
              ) : (
                <div
                  className={`rounded-full bg-[#EF6C00] flex items-center justify-center text-white font-medium mx-auto ${
                    sidebarCollapsed ? 'w-10 h-10 text-sm' : 'w-[88px] h-[88px] text-3xl'
                  }`}
                >
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
            {!sidebarCollapsed && (
              <div className="mt-3 text-center">
                <p className="font-medium text-sm text-[#0F0F0F]">Your channel</p>
                <p className="text-xs text-[#606060]">{profile?.name}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/studio' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-2.5 transition-colors ${
                    sidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#F2F2F2] text-[#0F0F0F]'
                      : 'text-[#606060] hover:bg-[#F2F2F2] hover:text-[#0F0F0F]'
                  }`}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Items */}
          <div className="border-t border-[#E5E5E5] pt-2 mt-2">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-2.5 transition-colors ${
                    sidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#F2F2F2] text-[#0F0F0F]'
                      : 'text-[#606060] hover:bg-[#F2F2F2] hover:text-[#0F0F0F]'
                  }`}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[240px]'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

