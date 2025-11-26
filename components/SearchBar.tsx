'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSearch } from 'react-icons/io5';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

export default function SearchBar({ initialQuery = '', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          className="w-full h-12 pl-12 pr-4 bg-[#ECECEC] rounded-full text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF0000]/20"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#FF0000] text-white text-sm font-medium rounded-full hover:bg-[#CC0000] transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}

