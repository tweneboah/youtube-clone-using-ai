'use client';

import Link from 'next/link';
import { FaYoutube } from 'react-icons/fa';
import { IoConstructOutline, IoRocketOutline, IoSparklesOutline } from 'react-icons/io5';
import { MdOutlineExplore } from 'react-icons/md';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] via-[#1a1a2e] to-[#0F0F0F] px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF0000]/30 to-[#FF0000]/10 flex items-center justify-center">
              <IoConstructOutline className="w-12 h-12 text-[#FF0000]" />
            </div>
          </div>
          {/* Floating particles */}
          <IoSparklesOutline className="absolute top-4 right-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
          <IoRocketOutline className="absolute bottom-4 left-1/4 w-5 h-5 text-blue-400 animate-bounce delay-100" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#AAAAAA] mb-2">
          We&apos;re building something amazing!
        </p>
        <p className="text-[#888888] mb-8 max-w-md mx-auto">
          This feature is currently under construction. Our team is working hard to bring you an incredible experience.
        </p>

        {/* Progress indicator */}
        <div className="max-w-xs mx-auto mb-8">
          <div className="flex justify-between text-sm text-[#888888] mb-2">
            <span>Progress</span>
            <span>75%</span>
          </div>
          <div className="h-2 bg-[#333333] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF0000] to-[#FF4444] rounded-full transition-all duration-1000"
              style={{ width: '75%' }}
            />
          </div>
        </div>

        {/* Features coming */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333333]">
            <div className="w-10 h-10 rounded-full bg-[#FF0000]/10 flex items-center justify-center mx-auto mb-2">
              <FaYoutube className="w-5 h-5 text-[#FF0000]" />
            </div>
            <p className="text-xs text-[#AAAAAA]">Premium Content</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333333]">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <MdOutlineExplore className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-[#AAAAAA]">New Explore</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333333]">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <IoSparklesOutline className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs text-[#AAAAAA]">AI Features</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF0000] text-white font-medium rounded-full hover:bg-[#CC0000] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#272727] text-white font-medium rounded-full hover:bg-[#383838] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#666666] mt-12">
          Stay tuned for updates! Follow us for the latest news.
        </p>
      </div>
    </div>
  );
}



