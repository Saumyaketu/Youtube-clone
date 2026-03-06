"use client";
import React, { useRef, useState } from "react";
import { useUser } from "../lib/AuthContext";
import PremiumModal from "./PremiumModal";

const VideoPlayer = ({ video }: any) => {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          onTimeUpdate={handleTimeUpdate}
        >
          <source
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default VideoPlayer;
