"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Clock, MoreVertical, Play, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import axiosInstance from "../lib/AxiosInstance";
import { useUser } from "../lib/AuthContext";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const WatchLaterContent = () => {
  const [WatchLater, setWatchLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadWatchLater();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWatchLater = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get(`/watch/${user?._id}`);
      const validItems = res.data.filter((item: any) => item.videoid !== null);
      setWatchLater(validItems);
    } catch (error) {
      console.error("Error loading WatchLater:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWatchLater = async (videoId: string) => {
    if (!user) return;
    try {
      await axiosInstance.post(`/watch/${videoId}`, {
        userId: user._id,
      });
      setWatchLater((prev) =>
        prev.filter((item) => item.videoid._id !== videoId),
      );
    } catch (error) {
      console.error("Error removing video:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          Save videos for later
        </p>
        <p className="text-sm">Sign in to access your Watch later playlist.</p>
      </div>
    );
  }

  if (WatchLater.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          No video saved yet
        </p>
        <p className="text-sm">Videos you save for later will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{WatchLater.length} videos</p>
        {WatchLater.length > 0 && (
          <Link href={`/watch/${WatchLater[0].videoid._id}?list=wl`}>
            <Button className="flex justify-between items-center gap-2">
              <Play className="w-4 h-4" />
              Play all
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {WatchLater.map((item) => {
          const isCloudinary = item.videoid?.filepath?.startsWith("http");
          const thumbnailUrl = isCloudinary
            ? item.videoid.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
            : "/file.svg";

          return (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${item.videoid._id}`} className="shrink-0">
                <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={item.videoid.videotitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                    {formatDuration(item.videoid.duration)}
                  </div>
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${item.videoid._id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                    {item.videoid.videotitle}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600">
                  {item.videoid.videochannel}
                </p>
                <p className="text-sm text-gray-600">
                  {item.videoid.views?.toLocaleString() || 0} views •{" "}
                  {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRemoveWatchLater(item.videoid._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from Watch Later
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WatchLaterContent;
