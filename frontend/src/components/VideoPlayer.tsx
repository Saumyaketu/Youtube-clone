"use client";
import React, { useRef, useState } from "react";
import { useUser } from "../lib/AuthContext";
import PremiumModal from "./PremiumModal";
import { useRouter } from "next/navigation";

const VideoPlayer = ({ video, onNextVideo, onShowComments }: any) => {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const WATCH_LIMITS: { [key: string]: number } = {
    Free: 5 * 60,
    Bronze: 7 * 60,
    Silver: 10 * 60,
    Gold: Infinity,
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentPlan = user?.plan || "Free";
    const timeLimit = WATCH_LIMITS[currentPlan];

    if (videoRef.current.currentTime >= timeLimit) {
      videoRef.current.pause();
      setIsModalOpen(true);
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
          className="w-full h-full"
          controls
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
