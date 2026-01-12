"use client";
import React, { useRef } from "react";

const VideoPlayer = ({ video }: any) => {
  const videos = "/video/vdo.mp4";
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} className="w-full h-full" controls>
        <source src={videos} type="video/mp4"/>
          Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
