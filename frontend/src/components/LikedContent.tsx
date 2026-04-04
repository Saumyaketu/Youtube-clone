"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, Play, ThumbsUp, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface Video {
  _id: string;
  videotitle: string;
  videochannel: string;
  views: number;
  createdAt: string;
  filename: string;
  filepath: string;
  duration: number;
}

interface LikeItem {
  _id: string;
  videoid: Video;
  viewer: string;
  createdAt: string;
}

const LikedContent = () => {
  const { user } = useUser();
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/like/${user._id}`);
        setLikes(res.data);
      } catch (error) {
        console.error("Error loading liked videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, [user]);

  const handleRemoveLike = async (videoId: string, likeId: string) => {
    if (!user) return;
    try {
      await axiosInstance.post(`/like/like/${videoId}`, {
        userId: user._id,
      });
      setLikes((prev) => prev.filter((item) => item._id !== likeId));
    } catch (error) {
      console.error("Error removing like item:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <ThumbsUp className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          Keep track of videos you like
        </p>
        <p className="text-sm">Sign in to see your liked videos.</p>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <ThumbsUp className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          No liked videos yet
        </p>
        <p className="text-sm">Videos you like will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{likes.length} videos</p>
        {likes.length > 0 && (
          <Link href={`/watch/${likes[0].videoid._id}?list=liked`}>
            <Button className="flex justify-between items-center gap-2">
              <Play className="w-4 h-4" />
              Play all
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {likes.map((item) => {
          const isCloudinary = item.videoid?.filepath?.startsWith("http");
          const thumbnailUrl = isCloudinary
            ? item.videoid.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
            : "/file.svg";

          return (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${item.videoid._id}`} className="shrink-0">
                <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden dark:bg-gray-800">
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
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                    {item.videoid.videotitle}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.videoid.videochannel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.videoid.views?.toLocaleString() || 0} views •{" "}
                  {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Liked {formatDistanceToNow(new Date(item.createdAt))} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-gray-800 dark:text-gray-100"
                >
                  <DropdownMenuItem
                    onClick={() => handleRemoveLike(item.videoid._id, item._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from liked videos history
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

export default LikedContent;
