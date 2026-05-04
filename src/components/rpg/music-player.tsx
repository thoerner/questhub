"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const TRACKS = [
  { src: "/audio/ballad-of-the-rusted-kingdom.mp3", title: "Ballad of the Rusted Kingdom" },
  { src: "/audio/commit-at-the-rusted-shrine.mp3", title: "Commit at the Rusted Shrine" },
  { src: "/audio/merge-conflict-at-midnight.mp3", title: "Merge Conflict at Midnight" },
];

function loadPrefs() {
  if (typeof window === "undefined") return { trackIndex: 0, muted: false };
  try {
    const raw = localStorage.getItem("qh-music");
    if (raw) return JSON.parse(raw) as { trackIndex: number; muted: boolean };
  } catch {}
  return { trackIndex: 0, muted: false };
}

function savePrefs(trackIndex: number, muted: boolean) {
  try {
    localStorage.setItem("qh-music", JSON.stringify({ trackIndex, muted }));
  } catch {}
}

export function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const prefs = loadPrefs();
    setTrackIndex(prefs.trackIndex);
    setIsMuted(prefs.muted);

    if (prefs.muted) return;

    const audio = audioRef.current;
    if (!audio) return;
    audio.src = TRACKS[prefs.trackIndex].src;
    audio.muted = prefs.muted;

    const tryAutoplay = () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        const startOnInteraction = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          document.removeEventListener("click", startOnInteraction);
          document.removeEventListener("keydown", startOnInteraction);
        };
        document.addEventListener("click", startOnInteraction, { once: true });
        document.addEventListener("keydown", startOnInteraction, { once: true });
      });
    };
    tryAutoplay();
  }, []);

  useEffect(() => {
    savePrefs(trackIndex, isMuted);
  }, [trackIndex, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = TRACKS[trackIndex].src;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnded = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = TRACKS[trackIndex].src;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying, trackIndex]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const prevTrack = useCallback(() => {
    setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} onEnded={handleEnded} preload="none" />

      {isExpanded ? (
        <div className="ornate-border rounded-sm bg-surface-raised p-2.5 w-64 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-[7px] text-accent-gold tracking-wider uppercase leading-none">
              Tavern Jukebox
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-text-muted hover:text-text-primary text-xs leading-none cursor-pointer"
              aria-label="Collapse player"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] text-accent-gold truncate leading-tight">
            {TRACKS[trackIndex].title}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <PlayerButton onClick={prevTrack} label="Previous track">
                ⏮
              </PlayerButton>
              <PlayerButton onClick={togglePlay} label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? "⏸" : "▶"}
              </PlayerButton>
              <PlayerButton onClick={nextTrack} label="Next track">
                ⏭
              </PlayerButton>
            </div>
            <PlayerButton onClick={toggleMute} label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? "🔇" : "🔊"}
            </PlayerButton>
          </div>

          <div className="space-y-px">
            {TRACKS.map((track, i) => (
              <button
                key={track.src}
                onClick={() => setTrackIndex(i)}
                className={`
                  w-full text-left px-1.5 py-1 text-[9px] rounded-sm truncate cursor-pointer transition-colors
                  ${i === trackIndex
                    ? "bg-accent-gold/10 text-accent-gold border border-accent-gold-dim"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                  }
                `}
              >
                {i === trackIndex && isPlaying ? "♪ " : ""}
                {track.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="ornate-border rounded-sm bg-surface-raised w-8 h-8 flex items-center justify-center text-accent-gold hover:text-accent transition-colors cursor-pointer"
          aria-label="Open music player"
        >
          <span className="text-sm">{isPlaying ? "♪" : "♫"}</span>
        </button>
      )}
    </div>
  );
}

function PlayerButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-sm text-sm text-text-secondary hover:text-accent-gold hover:bg-surface-overlay transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
