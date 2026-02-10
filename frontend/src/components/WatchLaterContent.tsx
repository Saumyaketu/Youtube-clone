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

const WatchLaterContent = () => {
  const [WatchLater, setWatchLater] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadWatchLater();
    } else {
      setLoading(true);
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

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Save videos for later</h2>
        <p className="text-gray-600">
          Sign in to access your Watch later playlist.
        </p>
      </div>
    );
  }

  if (WatchLater.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No video saved yet</h2>
        <p className="text-gray-600">
          Videos you save for later will appear here.
        </p>
      </div>
    );
  }

  const videos = "/video/vdo.mp4";

  return (
    <div className="space-y-4">
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
        {WatchLater.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoid._id}`} className="shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={videos}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
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
                {item.videoid.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveWatchLater(item.video._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from Watch Later
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchLaterContent;
