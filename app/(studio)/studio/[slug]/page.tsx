'use client';

import { useParams } from 'next/navigation';
import { MdOutlineConstruction } from 'react-icons/md';

const pageInfo: Record<string, { title: string; description: string }> = {
  community: {
    title: 'Community',
    description: 'Connect with your viewers through posts, polls, and more.',
  },
  languages: {
    title: 'Languages',
    description: 'Manage subtitles and translations for your videos.',
  },
  detection: {
    title: 'Content detection',
    description: 'Review potential copyright claims and manage content ID.',
  },
  earn: {
    title: 'Earn',
    description: 'Track your channel monetization and revenue.',
  },
  music: {
    title: 'Creator Music',
    description: 'Find and license music for your videos.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your channel settings and preferences.',
  },
  feedback: {
    title: 'Send feedback',
    description: 'Help us improve YouTube Studio.',
  },
};

export default function StudioPlaceholderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const info = pageInfo[slug] || {
    title: 'Coming Soon',
    description: 'This feature is under development.',
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F2F2F2] flex items-center justify-center">
        <MdOutlineConstruction className="w-10 h-10 text-[#909090]" />
      </div>
      <h1 className="text-2xl font-medium text-[#0F0F0F] mb-3">{info.title}</h1>
      <p className="text-sm text-[#606060] mb-6">{info.description}</p>
      <p className="text-xs text-[#909090]">This feature is coming soon to YouTube Studio</p>
    </div>
  );
}


