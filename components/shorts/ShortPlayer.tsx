'use client';

import { useRef, useState, useEffect } from 'react';
import { IoPlay, IoPause, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';

interface ShortPlayerProps {
  videoUrl: string;
  isVisible: boolean;
  onVideoEnd?: () => void;
}

export default function ShortPlayer({ videoUrl, isVisible, onVideoEnd }: ShortPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Auto-play when visible
  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {
          // Autoplay blocked, user needs to interact
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isVisible]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleVideoEnd = () => {
    // Loop the video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    onVideoEnd?.();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#F2F2F2]"
      onClick={togglePlay}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
      />

      {/* Center Play/Pause Button (shows on tap/click) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
          {isPlaying ? (
            <IoPause className="w-8 h-8 text-white" />
          ) : (
            <IoPlay className="w-8 h-8 text-white ml-1" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleProgressClick(e);
        }}
      >
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mute Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isMuted ? (
          <IoVolumeMute className="w-5 h-5 text-white" />
        ) : (
          <IoVolumeHigh className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}

