import { startTransition, useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../lib/AuthContext";
import axiosInstance from "../../lib/AxiosInstance";
import { getOriginalVideoUrl, getQualityOptions } from "./utils";
import type { VideoData } from "./types";

const WATCH_LIMITS: Record<string, number> = {
  Free: 5 * 60,
  Bronze: 7 * 60,
  Silver: 10 * 60,
  Gold: Infinity,
};

type UseVideoPlayerOptions = {
  video: VideoData;
  onNextVideo?: () => void;
  onShowComments?: () => void;
};

export const useVideoPlayer = ({
  video,
  onNextVideo,
  onShowComments,
}: UseVideoPlayerOptions) => {
  const { user } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playableSrc, setPlayableSrc] = useState<string>();
  const [activeSrc, setActiveSrc] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [isChangingQuality, setIsChangingQuality] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalWatched, setTotalWatched] = useState(0);

  const unsyncedTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const resumeAfterSourceChangeRef = useRef(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qualityOptions = getQualityOptions(video, playableSrc);

  useEffect(() => {
    if (user) {
      startTransition(() => setTotalWatched(user.watchTimeToday || 0));
      return;
    }

    const stored = localStorage.getItem("guestWatchData");
    if (!stored) return;

    try {
      const { date, time } = JSON.parse(stored);
      if (date === new Date().toDateString()) {
        startTransition(() => setTotalWatched(time));
      } else {
        localStorage.removeItem("guestWatchData");
      }
    } catch {
      console.error("Failed to parse guest watch data");
    }
  }, [user]);

  useEffect(() => {
    lastTimeRef.current = 0;
    let objectUrl: string | null = null;

    const resolveVideoSource = async () => {
      const defaultUrl = getOriginalVideoUrl(video);

      if ("caches" in window) {
        try {
          const cache = await caches.open("youtube-offline-videos");
          const cachedResponse = await cache.match(defaultUrl);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            objectUrl = URL.createObjectURL(blob);
            setPlayableSrc(objectUrl);
            setActiveSrc(objectUrl);
            return;
          }
        } catch (error) {
          console.error("Failed to load from cache", error);
        }
      }

      setPlayableSrc(defaultUrl);
      setActiveSrc(defaultUrl);
    };

    void resolveVideoSource();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (unsyncedTimeRef.current < 5 || !user?._id || user.plan === "Gold") {
        return;
      }

      const timeToSync = unsyncedTimeRef.current;
      unsyncedTimeRef.current = 0;
      axiosInstance
        .post(`/auth/sync-watch-time/${user._id}`, { timeWatched: timeToSync })
        .catch(() => {
          unsyncedTimeRef.current += timeToSync;
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [user?._id, user?.plan]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const nextTime = videoRef.current.currentTime;
    setCurrentTime(nextTime);
    const delta = nextTime - lastTimeRef.current;

    if (delta > 0 && delta < 2) {
      setTotalWatched((previous) => {
        const nextTotal = previous + delta;
        if (!user) {
          localStorage.setItem(
            "guestWatchData",
            JSON.stringify({
              date: new Date().toDateString(),
              time: nextTotal,
            }),
          );
        }
        return nextTotal;
      });
      unsyncedTimeRef.current += delta;
    }

    lastTimeRef.current = nextTime;
    const timeLimit = WATCH_LIMITS[user?.plan || "Free"];
    if (totalWatched >= timeLimit) {
      videoRef.current.pause();
      setIsModalOpen(true);
    }
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) void videoRef.current.play();
    else videoRef.current.pause();
  };

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    if (videoRef.current) videoRef.current.volume = nextVolume;
    setVolume(nextVolume);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const handleMediaVolumeChange = () => {
    if (videoRef.current) setVolume(videoRef.current.volume);
  };

  const handleQualityChange = (nextQuality: string) => {
    const nextSource = qualityOptions.find(
      (option) => option.value === nextQuality,
    );
    if (!videoRef.current || !nextSource || nextSource.src === activeSrc) {
      setQuality(nextQuality);
      setShowSettings(false);
      return;
    }

    pendingSeekRef.current = videoRef.current.currentTime;
    resumeAfterSourceChangeRef.current = !videoRef.current.paused;
    setIsChangingQuality(true);
    setActiveSrc(nextSource.src);
    setQuality(nextQuality);
    setShowSettings(false);
  };

  const restorePendingPosition = () => {
    if (!videoRef.current || pendingSeekRef.current === null) return;

    const nextTime = Math.min(
      pendingSeekRef.current,
      Number.isFinite(videoRef.current.duration)
        ? videoRef.current.duration
        : pendingSeekRef.current,
    );
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    return nextTime;
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const knownDuration = Number(video.duration);
    setDuration(
      knownDuration > 0 ? knownDuration : videoRef.current.duration,
    );
    setIsChangingQuality(false);
  };

  const handleCanPlay = () => {
    if (!videoRef.current || pendingSeekRef.current === null) return;
    restorePendingPosition();

    if (resumeAfterSourceChangeRef.current) {
      void videoRef.current.play();
      return;
    }

    pendingSeekRef.current = null;
    resumeAfterSourceChangeRef.current = false;
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    if (pendingSeekRef.current === null) return;
    restorePendingPosition();
    pendingSeekRef.current = null;
    resumeAfterSourceChangeRef.current = false;
  };

  const toggleFullscreen = async () => {
    const player = videoRef.current?.parentElement;
    if (!player) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await player.requestFullscreen();
  };

  const executeGesture = (clicks: number, zone: string) => {
    if (!videoRef.current) return;
    if (clicks === 1 && zone === "middle") togglePlayback();
    else if (clicks === 2 && zone === "right") {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10,
      );
    } else if (clicks === 2 && zone === "left") {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 10,
      );
    } else if (clicks === 3 && zone === "middle") onNextVideo?.();
    else if (clicks === 3 && zone === "right") router.push("/");
    else if (clicks === 3 && zone === "left") onShowComments?.();
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const zone =
      x < rect.width / 3
        ? "left"
        : x > (rect.width * 2) / 3
          ? "right"
          : "middle";

    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      executeGesture(clickCountRef.current, zone);
      clickCountRef.current = 0;
    }, 300);
  };

  return {
    videoRef,
    activeSrc,
    isModalOpen,
    setIsModalOpen,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    setPlaybackRate,
    quality,
    isChangingQuality,
    showSettings,
    setShowSettings,
    isFullscreen,
    qualityOptions,
    togglePlayback,
    handleProgressChange,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleMediaVolumeChange,
    handleQualityChange,
    handleLoadedMetadata,
    handleCanPlay,
    handlePlaying,
    handleTimeUpdate,
    handleFullscreenChange: () => undefined,
    handleSeeked: () => {
      if (videoRef.current) lastTimeRef.current = videoRef.current.currentTime;
    },
    handleDurationChange: () => {
      if (!videoRef.current || !Number.isFinite(videoRef.current.duration)) return;
      const knownDuration = Number(video.duration);
      setDuration(knownDuration > 0 ? knownDuration : videoRef.current.duration);
    },
    handleError: () => setIsChangingQuality(false),
    toggleFullscreen,
    handleOverlayClick,
  };
};

export type VideoPlayerState = ReturnType<typeof useVideoPlayer>;
