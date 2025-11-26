'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

interface Subscription {
  _id: string;
  name: string;
  avatar: string;
}

interface UserData {
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  subscriptions: Subscription[];
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Auto-collapse sidebar on watch pages for theater mode
  const isWatchPage = pathname?.startsWith('/watch');

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const userId = (session.user as { id?: string })?.id;
          if (userId) {
            const res = await fetch(`/api/users/${userId}/subscriptions`);
            if (res.ok) {
              const data = await res.json();
              setUserData({
                user: {
                  _id: userId,
                  name: session.user.name || 'User',
                  avatar: session.user.image || undefined,
                },
                subscriptions: data.subscriptions || [],
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1]">
      {/* Fixed Topbar */}
      <Topbar user={userData?.user} onToggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar - Hidden on watch pages or when collapsed to mini */}
        {!isWatchPage && (
          <div className={`flex-shrink-0 ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
            <Sidebar
              subscriptions={userData?.subscriptions}
              collapsed={sidebarCollapsed}
            />
          </div>
        )}

        {/* Mini sidebar on watch pages */}
        {isWatchPage && !sidebarCollapsed && (
          <div className="flex-shrink-0 w-[72px]">
            <Sidebar
              subscriptions={userData?.subscriptions}
              collapsed={true}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-w-0 ${isWatchPage ? 'bg-white' : 'bg-[#F1F1F1]'}`}>
          <div className={isWatchPage ? '' : 'p-6'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
