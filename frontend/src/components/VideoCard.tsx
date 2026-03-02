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
  const normalizedPath = video.filepath ? video.filepath.replace(/\\/g, "/") : "";
  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <video
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${normalizedPath}`}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage />
            <AvatarFallback>{video.videochannel?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{video.videochannel}</p>
            <p className="text-sm text-gray-600">
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
