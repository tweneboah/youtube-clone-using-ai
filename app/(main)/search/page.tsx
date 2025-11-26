import { Suspense } from 'react';
import VideoGrid from '@/components/VideoGrid';
import SearchBar from '@/components/SearchBar';
import connectDB from '@/lib/mongodb';
import Video from '@/models/Video';
import { formatVideo } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function getSearchResults(query: string) {
  if (!query) return [];

  await connectDB();

  const videos = await Video.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  })
    .populate('userId', 'name avatar')
    .sort({ views: -1 })
    .limit(20)
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return videos.map((v: any) => formatVideo(v));
}

async function SearchResults({ query }: { query: string }) {
  const videos = await getSearchResults(query);
  const currentUser = await getCurrentUser();

  return (
    <VideoGrid
      videos={videos}
      title={query ? `Results for "${query}"` : 'Search Videos'}
      showViewMore={false}
      currentUserId={currentUser?.userId || null}
    />
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: query = '' } = await searchParams;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <SearchBar initialQuery={query} className="max-w-2xl" />
      </div>

      {/* Results */}
      <Suspense
        fallback={
          <div className="bg-white rounded-[20px] p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#66E3D3] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#555555] mt-4">Searching...</p>
            </div>
          </div>
        }
      >
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
