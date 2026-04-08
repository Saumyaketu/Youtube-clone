"use client";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const VideoCard = ({ video }: any) => {
  if (!video) return null;

  const isCloudinary = video?.filepath?.startsWith("http");
  const thumbnailUrl = isCloudinary
    ? video.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
    : "/file.svg";

  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-2 md:space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={thumbnailUrl}
            alt={video.videotitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/80 text-white text-[10px] md:text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <Avatar className="w-8 h-8 md:w-9 md:h-9 shrink-0">
            <AvatarImage />
            <AvatarFallback className="dark:text-white text-xs md:text-sm">
              {video.videochannel?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {video.videochannel}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {video.views.toLocaleString()} views •{" "}
              {video.createdAt
                ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                : "Just now"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;