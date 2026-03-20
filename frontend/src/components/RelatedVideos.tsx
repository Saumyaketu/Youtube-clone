"use client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import React from "react";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const RelatedVideos = ({ videos }: any) => {
  return (
    <div className="space-y-2">
      {videos.map((video: any) => {
        const isCloudinary = video?.filepath?.startsWith("http");
        const thumbnailUrl = isCloudinary
          ? video.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
          : "/file.svg";

        return (
          <Link
            key={video._id}
            href={`/watch/${video._id}`}
            className="flex gap-2 group"
          >
            <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden shrink-0 dark:bg-gray-800">
              <img
                src={thumbnailUrl}
                alt={video.videotitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {video.videotitle}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{video.videochannel}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {video.views?.toLocaleString() || 0} views •{" "}
                {formatDistanceToNow(new Date(video.createdAt))} ago
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RelatedVideos;
