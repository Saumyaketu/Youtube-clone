"use client";
import React, { useRef, useState, useEffect } from "react";
import { useUser } from "../lib/AuthContext";
import PremiumModal from "./PremiumModal";
import { useRouter } from "next/navigation";
import axiosInstance from "../lib/AxiosInstance";

const VideoPlayer = ({ video, onNextVideo, onShowComments }: any) => {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const [playableSrc, setPlayableSrc] = useState<string>();

  const [totalWatched, setTotalWatched] = useState(user?.watchTimeToday || 0);
  const unsyncedTimeRef = useRef(0);
  const lastTimeRef = useRef(0);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const WATCH_LIMITS: { [key: string]: number } = {
    Free: 5 * 60,
    Bronze: 7 * 60,
    Silver: 10 * 60,
    Gold: Infinity,
  };

  useEffect(() => {
    lastTimeRef.current = 0;
    let objectUrl: string | null = null;

    const resolveVideoSource = async () => {
      const defaultUrl = video?.filepath?.startsWith("http")
        ? video.filepath
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`;

      if ("caches" in window) {
        try {
          const cache = await caches.open("youtube-offline-videos");
          const cachedResponse = await cache.match(defaultUrl);

          if (cachedResponse) {
            console.log("Playing video from offline storage!");
            const blob = await cachedResponse.blob();
            objectUrl = URL.createObjectURL(blob);
            setPlayableSrc(objectUrl);
            return;
          }
        } catch (error) {
          console.error("Failed to load from cache", error);
        }
      }

      setPlayableSrc(defaultUrl);
    };

    if (video) resolveVideoSource();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [video]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (unsyncedTimeRef.current >= 5 && user?._id && user?.plan !== "Gold") {
        const timeToSync = unsyncedTimeRef.current;
        unsyncedTimeRef.current = 0;
        
        axiosInstance.post(`/auth/sync-watch-time/${user._id}`, { timeWatched: timeToSync })
          .catch((err) => {
            unsyncedTimeRef.current += timeToSync;
          });
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [user?._id, user?.plan]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const delta = currentTime - lastTimeRef.current;

    if (delta > 0 && delta < 2) {
      setTotalWatched((prev: number) => prev + delta);
      unsyncedTimeRef.current += delta;
    }
    
    lastTimeRef.current = currentTime;

    const currentPlan = user?.plan || "Free";
    const timeLimit = WATCH_LIMITS[currentPlan];

    if (totalWatched >= timeLimit) {
      videoRef.current.pause();
      setIsModalOpen(true);
    }
  };

  const handleSeeked = () => {
    if (videoRef.current) {
      lastTimeRef.current = videoRef.current.currentTime;
    }
  };

  const videoUrl = video?.filepath?.startsWith("http")
    ? video.filepath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    let zone = "middle";
    if (x < width / 3) zone = "left";
    else if (x > (width * 2) / 3) zone = "right";

    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      executeGesture(clickCountRef.current, zone);
      clickCountRef.current = 0;
    }, 300);
  };

  const executeGesture = (clicks: number, zone: string) => {
    if (!videoRef.current) return;

    if (clicks === 1 && zone === "middle") {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } else if (clicks === 2 && zone === "right") {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10,
      );
    } else if (clicks === 2 && zone === "left") {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 10,
      );
    } else if (clicks === 3 && zone === "middle") {
      if (onNextVideo) onNextVideo();
    } else if (clicks === 3 && zone === "right") {
      router.push("/");
    } else if (clicks === 3 && zone === "left") {
      if (onShowComments) onShowComments();
    }
  };
  return (
    <>
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          src={playableSrc}
          className="w-full h-full"
          controls
          controlsList="nodownload"
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          className="absolute top-0 left-0 w-full h-[85%] z-10 cursor-pointer"
          onClick={handleOverlayClick}
        />
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default VideoPlayer;
