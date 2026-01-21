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

interface WatchLaterItem {
  _id: string;
  videoid: string;
  viewer: string;
  watchedon: string;
  video: {
    _id: string;
    videotitle: string;
    videochannel: string;
    views: number;
    createdAt: string;
  };
}

const user: any = {
  id: "1",
  name: "John",
  email: "john@example.com",
  image: "https://github.com/shadcn.png?height=32&width=32",
};

const WatchLaterContent = () => {
  
  const [WatchLater, setWatchLater] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      const WatchLaterData = [
        {
          _id: "h1",
          videoid: "1",
          viewer: user.id,
          watchedon: new Date(Date.now() - 3600000).toISOString(),
          video: {
            _id: "1",
            videotitle: "Amazing Nature Documentry",
            videochannel: "Nature Channel",
            views: 450,
            createdAt: new Date().toISOString(),
          },
        },
        {
          _id: "h2",
          videoid: "2",
          viewer: user.id,
          watchedon: new Date(Date.now() - 7200000).toISOString(),
          video: {
            _id: "2",
            videotitle: "Cooking Tutorial: Perfect Pasta",
            videochannel: "Chef's Kitchen",
            views: 230,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        },
      ];
      setWatchLater(WatchLaterData);
    } catch (error) {
      console.error("Error loading WatchLater:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const handleRemoveWatchLater = async (WatchLaterId: string) => {
    try {
      console.log("Removing WatchLater item with ID:", WatchLaterId);
      setWatchLater((prevWatchLater) =>
        prevWatchLater.filter((item) => item._id !== WatchLaterId)
      );
    } catch (error) {
      console.error("Error removing WatchLater item:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Save videos for later
        </h2>
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
        <p className="text-gray-600">Videos you save for later will appear here.</p>
      </div>
    );
  }

  const videos = "/video/vdo.mp4";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{WatchLater.length} videos</p>
        <Button className="flex justify-between items-center">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>

      <div className="space-y-4">
        {WatchLater.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.video._id}`} className="shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={videos}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.video._id}`}>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                  {item.video.videotitle}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">{item.video.videochannel}</p>
              <p className="text-sm text-gray-600">
                {item.video.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.video.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Watched {formatDistanceToNow(new Date(item.watchedon))}
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
                <DropdownMenuItem onClick={() => handleRemoveWatchLater(item._id)}>
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
