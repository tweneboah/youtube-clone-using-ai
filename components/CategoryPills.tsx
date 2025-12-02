'use client';

import { useRef, useState, useEffect } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = () => {
    const container = containerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative flex items-center">
      {/* Left Arrow */}
      {showLeftArrow && (
        <div className="absolute left-0 z-10 flex items-center">
          <div className="bg-gradient-to-r from-white via-white to-transparent pr-6 pl-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 hover:bg-[#E5E5E5] rounded-full transition-colors"
            >
              <IoChevronBack className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Categories Container */}
      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-1"
        onScroll={checkScrollButtons}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-[#0F0F0F] text-white'
                : 'bg-[#F2F2F2] text-[#0F0F0F] hover:bg-[#E5E5E5]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <div className="absolute right-0 z-10 flex items-center">
          <div className="bg-gradient-to-l from-white via-white to-transparent pl-6 pr-1">
            <button
              onClick={() => scroll('right')}
              className="p-1.5 hover:bg-[#E5E5E5] rounded-full transition-colors"
            >
              <IoChevronForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}







