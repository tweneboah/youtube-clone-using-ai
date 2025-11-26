'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
}

export default function VideoPlayer({ videoUrl, videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  useEffect(() => {
    // Record view only once when video starts playing
    const recordView = async () => {
      if (!hasRecordedView) {
        try {
          await fetch(`/api/videos/${videoId}/view`, {
            method: 'POST',
          });
          setHasRecordedView(true);
        } catch (error) {
          console.error('Error recording view:', error);
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', recordView);
      return () => video.removeEventListener('play', recordView);
    }
  }, [videoId, hasRecordedView]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        className="w-full h-full object-contain"
        poster=""
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
