'use client';

/**
 * PremiumVideoPlayer — luxe custom video player (no native controls).
 *
 * Next.js: drop this file in /components (it is fully standalone — only
 * deps are react + lucide-react) and use:
 *
 *   <PremiumVideoPlayer src="/videos/video1.mp4" badgeLeft="SÉBIKHOTANE • VUE DRONE" badgeRight="4K ULTRA HD" />
 *
 * Vite/React: identical, the 'use client' directive is simply ignored.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume1, Volume2, VolumeX, Maximize2, Minimize2, Loader2 } from 'lucide-react';

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const formatTime = (seconds: number): string => {
  const s = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
};

export interface PremiumVideoPlayerProps {
  src: string;
  /** Poster shown before playback (e.g. an extracted frame) */
  poster?: string;
  /** Top-left elegant overlay, e.g. "SÉBIKHOTANE • VUE DRONE" */
  badgeLeft?: string;
  /** Top-right overlay, e.g. "4K ULTRA HD" */
  badgeRight?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PremiumVideoPlayer({
  src,
  poster,
  badgeLeft,
  badgeRight,
  className = '',
  ariaLabel = 'Video player',
}: PremiumVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const prevVolume = useRef<number>(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0); // 0 → 1
  const [buffered, setBuffered] = useState(0); // 0 → 1
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  /* ------------------------------ controls show / auto-hide ------------------------------ */

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused && !dragging) setControlsVisible(false);
    }, 2600);
  }, [dragging]);

  // While paused, controls always stay visible
  useEffect(() => {
    if (!isPlaying) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setControlsVisible(true);
    } else {
      bumpControls();
    }
  }, [isPlaying, bumpControls]);

  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); }, []);

  /* --------------------------------- media event wiring --------------------------------- */

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      if (!dragging && Number.isFinite(v.duration) && v.duration > 0) {
        setProgress(v.currentTime / v.duration);
      }
    };
    const onMeta = () => {
      setDuration(v.duration);
      // Paint the very first frame instead of a black box (preload="metadata")
      try { if (v.currentTime < 0.1) v.currentTime = 0.1; } catch { /* ignore */ }
    };
    const onProgressEvt = () => {
      const b = v.buffered;
      if (b.length > 0 && Number.isFinite(v.duration) && v.duration > 0) {
        setBuffered(b.end(b.length - 1) / v.duration);
      }
    };
    const onPlay = () => { setIsPlaying(true); setIsWaiting(false); };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsWaiting(true);
    const onPlaying = () => setIsWaiting(false);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    const onVolume = () => { setIsMuted(v.muted); setVolume(v.volume); };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('progress', onProgressEvt);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('ended', onEnded);
    v.addEventListener('volumechange', onVolume);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('progress', onProgressEvt);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('volumechange', onVolume);
    };
  }, [dragging]);

  /* ------------------------------------ fullscreen -------------------------------------- */

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ('webkitRequestFullscreen' in el) {
      (el as HTMLElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    }
  }, []);

  /* -------------------------------------- actions --------------------------------------- */

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.muted || v.volume === 0) {
      v.muted = false;
      if (v.volume === 0) v.volume = prevVolume.current || 0.6;
    } else {
      prevVolume.current = v.volume;
      v.muted = true;
    }
    bumpControls();
  }, [bumpControls]);

  const onVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    bumpControls();
  };

  /* -------------------------------- seek bar logic -------------------------------------- */

  const seekFromClientX = (clientX: number) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !Number.isFinite(v.duration)) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  const onSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Capture may fail on synthetic/minor pointer events — the seek must
    // still work, so never let this throw before seeking.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    setDragging(true);
    seekFromClientX(e.clientX);
  };
  const onSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverRatio(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    if (dragging) seekFromClientX(e.clientX);
  };
  const onSeekPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      seekFromClientX(e.clientX);
      setDragging(false);
    }
  };

  /* ------------------------------------ keyboard ---------------------------------------- */

  const onKeyDown = (e: React.KeyboardEvent) => {
    const v = videoRef.current;
    if (!v) return;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault(); togglePlay(); break;
      case 'm':
        toggleMute(); break;
      case 'f':
        toggleFullscreen(); break;
      case 'ArrowRight':
        e.preventDefault(); v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); bumpControls(); break;
      case 'ArrowLeft':
        e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); bumpControls(); break;
      default:
        break;
    }
  };

  const volumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const VolIcon = volumeIcon;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={bumpControls}
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
      onClick={togglePlay}
      className={`group/player relative isolate overflow-hidden bg-black outline-none
        ${isFullscreen ? 'rounded-none' : 'rounded-inner'}
        ring-1 ring-[#FED65B]/25 shadow-elev-3
        focus-visible:ring-[#FED65B]/60 transition-shadow cursor-pointer select-none ${className}`}
      style={{ transitionTimingFunction: EASE }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="w-full h-full object-cover"
        onClick={(e) => e.stopPropagation()}
      />

      {/* ---------- Elegant top badges ---------- */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none z-20">
        {badgeLeft && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-3 py-1 text-micro sm:text-caption font-medium uppercase tracking-[0.18em] text-[#FED65B] ring-1 ring-[#FED65B]/40 shadow-elev-2">
            <span className="w-1 h-1 rounded-full bg-[#FED65B]" />
            {badgeLeft}
          </span>
        )}
        {badgeRight && (
          <span className="inline-flex items-center rounded-full bg-black/45 backdrop-blur-md px-2.5 py-1 text-micro sm:text-caption font-bold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/15 shadow-elev-2">
            {badgeRight}
          </span>
        )}
      </div>

      {/* ---------- Center play / buffering ---------- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className={`pointer-events-auto relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
            bg-black/35 backdrop-blur-md ring-1 ring-[#FED65B]/50 text-[#FED65B]
            shadow-[0_0_40px_rgba(212,175,55,0.25)]
            transition-all duration-400 hover:scale-105 hover:bg-black/50 active:scale-95
            ${isPlaying && !isWaiting ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}`}
          style={{ transitionTimingFunction: EASE }}
        >
          {isWaiting ? (
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
          ) : (
            <span className="relative block w-7 h-7 sm:w-8 sm:h-8">
              <Play
                className={`absolute inset-0 w-full h-full fill-current transition-all duration-400
                  ${isPlaying ? 'scale-50 opacity-0' : 'scale-100 opacity-100 translate-x-0.5'}`}
              />
              <Pause
                className={`absolute inset-0 w-full h-full fill-current transition-all duration-400
                  ${isPlaying ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
              />
            </span>
          )}
        </button>
      </div>

      {/* ---------- Custom control bar (hover reveal) ---------- */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-3 bottom-3 z-30 transition-all duration-400
          ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}
        style={{ transitionTimingFunction: EASE }}
      >
        <div className="rounded-card bg-black/55 backdrop-blur-md ring-1 ring-[#FED65B]/25 shadow-elev-3 px-3 sm:px-4 pt-2.5 pb-2 space-y-1.5">
          {/* Seek bar with hover time preview */}
          <div
            ref={progressRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(progress * duration)}
            tabIndex={-1}
            onPointerDown={onSeekPointerDown}
            onPointerMove={onSeekPointerMove}
            onPointerUp={onSeekPointerUp}
            onPointerLeave={() => setHoverRatio(null)}
            className="relative py-2 cursor-pointer group/seek touch-none"
          >
            <div className="relative h-1.5 rounded-full bg-white/15 overflow-hidden">
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 w-full bg-white/25 origin-left"
                style={{ transform: `scaleX(${buffered})` }}
              />
              {/* Gold progress (GPU-friendly scaleX) */}
              <div
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#8C7A53] via-[#FED65B] to-[#FED65B] origin-left"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>

            {/* Playhead knob */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FED65B]
                ring-2 ring-[#FED65B] shadow-[0_0_12px_rgba(212,175,55,0.7)] pointer-events-none
                transition-opacity duration-400 ${hoverRatio !== null || dragging ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: `${progress * 100}%` }}
            />

            {/* Hover time preview tooltip */}
            <div
              className={`absolute bottom-full mb-1.5 -translate-x-1/2 rounded-micro bg-black/85 backdrop-blur-md
                ring-1 ring-[#FED65B]/40 px-2 py-0.5 text-caption font-mono tabular-nums text-[#FED65B]
                pointer-events-none transition-opacity duration-200
                ${hoverRatio !== null && !dragging ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: hoverRatio !== null ? `${hoverRatio * 100}%` : '0%' }}
            >
              {formatTime((hoverRatio ?? 0) * duration)}
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play / Pause */}
            <button
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={togglePlay}
              className="tap-44 w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white
                hover:bg-white/10 active:scale-90 transition-all duration-400 cursor-pointer shrink-0"
            >
              <span className="relative block w-4 h-4">
                <Play
                  className={`absolute inset-0 w-full h-full fill-current transition-all duration-400
                    ${isPlaying ? 'scale-50 opacity-0' : 'scale-100 opacity-100 translate-x-px'}`}
                />
                <Pause
                  className={`absolute inset-0 w-full h-full fill-current transition-all duration-400
                    ${isPlaying ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                />
              </span>
            </button>

            {/* Time */}
            <span className="font-mono text-caption sm:text-caption tabular-nums text-white/85 tracking-wide shrink-0">
              {formatTime(progress * duration)}
              <span className="text-white/60"> / {formatTime(duration)}</span>
            </span>

            <div className="flex-1" />

            {/* Volume + mute (slider always visible on touch, hover-reveal on desktop) */}
            <div className="flex items-center group/vol shrink-0">
              <button
                type="button"
                aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                onClick={toggleMute}
                className="tap-44 w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white
                  hover:bg-white/10 active:scale-90 transition-all duration-400 cursor-pointer"
              >
                <VolIcon className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={onVolumeInput}
                aria-label="Volume"
                className={`tap-44 h-1 accent-[#FED65B] cursor-pointer transition-all duration-400
                  w-14 opacity-100 sm:w-0 sm:opacity-0 sm:group-hover/vol:w-14 sm:group-hover/vol:opacity-100`}
                style={{ transitionTimingFunction: EASE }}
              />
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              onClick={toggleFullscreen}
              className="tap-44 w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white
                hover:bg-white/10 active:scale-90 transition-all duration-400 cursor-pointer shrink-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
