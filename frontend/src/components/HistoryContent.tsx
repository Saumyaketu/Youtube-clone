"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Clock, MoreVertical, X } from "lucide-react";
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

const HistoryContent = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const historyData = await axiosInstance.get(`/history/${user?._id}`);
      const validHistory = historyData.data.filter(
        (item: any) => item.videoid !== null,
      );
      setHistory(validHistory);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const handleRemoveHistory = async (historyId: string) => {
    try {
      await axiosInstance.delete(`/history/${historyId}`);
      setHistory((prevHistory) =>
        prevHistory.filter((item) => item._id !== historyId),
      );
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          Keep track of what you watch
        </p>
        <p className="text-sm">Watch history isn't viewable when signed out.</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mx-auto text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium text-foreground">
          No watch history yet
        </p>
        <p className="text-sm">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {history.length} videos
        </p>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
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
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                    {item.videoid.videotitle}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.videoid.videochannel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.videoid.views?.toLocaleString() || 0} views •{" "}
                  {formatDistanceToNow(new Date(item.createdAt))} ago
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
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-gray-800 dark:text-gray-100"
                >
                  <DropdownMenuItem
                    onClick={() => handleRemoveHistory(item._id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from watch history
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

export default HistoryContent;
