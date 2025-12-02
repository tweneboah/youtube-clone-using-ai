'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { BiFullscreen, BiExitFullscreen } from 'react-icons/bi';
import { MdVolumeUp, MdVolumeOff, MdPause, MdPlayArrow } from 'react-icons/md';

interface LivePlayerProps {
  playbackUrl: string;
  isLive: boolean;
  ended: boolean;
  title: string;
  thumbnailUrl?: string;
}

export default function LivePlayer({
  playbackUrl,
  isLive,
  ended,
  title,
  thumbnailUrl,
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLive || ended) return;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          // Low latency optimizations
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 3,
          liveDurationInfinity: true,
          highBufferWatchdogPeriod: 1,
          // Faster start
          maxBufferLength: 4,
          maxMaxBufferLength: 10,
          maxBufferSize: 0,
          maxBufferHole: 0.5,
          // Quick recovery
          fragLoadingTimeOut: 5000,
          manifestLoadingTimeOut: 5000,
          levelLoadingTimeOut: 5000,
        });

        hlsRef.current = hls;
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);
        
        // Jump to live edge when falling behind
        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          if (data.details.live && video) {
            const liveEdge = data.details.totalduration;
            const currentTime = video.currentTime;
            const behindLive = liveEdge - currentTime;
            
            // If more than 8 seconds behind, jump to live
            if (behindLive > 8) {
              video.currentTime = liveEdge - 2;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
          setIsPlaying(true);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setHasError(true);
            console.error('HLS Error:', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = playbackUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(console.error);
          setIsPlaying(true);
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackUrl, isLive, ended]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const jumpToLive = () => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    if (!video || !hls) return;

    // Jump to the live edge
    const levels = hls.levels;
    if (levels && levels.length > 0) {
      const level = levels[hls.currentLevel] || levels[0];
      if (level?.details?.totalduration) {
        video.currentTime = level.details.totalduration - 1;
      }
    }
    video.play();
  };

  if (ended) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Stream Ended</h3>
          <p className="text-white/70">This live stream has ended</p>
        </div>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Waiting for stream...</h3>
          <p className="text-white/70">The stream will start soon</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        muted={isMuted}
      />

      {/* LIVE Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded uppercase flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <p className="text-white mb-2">Unable to load stream</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            {isPlaying ? (
              <MdPause className="w-6 h-6" />
            ) : (
              <MdPlayArrow className="w-6 h-6" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isMuted || volume === 0 ? (
                <MdVolumeOff className="w-6 h-6" />
              ) : (
                <MdVolumeUp className="w-6 h-6" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-red-500"
            />
          </div>

          {/* Jump to Live Button */}
          <button
            onClick={jumpToLive}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
            title="Jump to live"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            {isFullscreen ? (
              <BiExitFullscreen className="w-6 h-6" />
            ) : (
              <BiFullscreen className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

