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

interface HistoryItem {
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

const HistoryContent = () => {
  const user: any = {
    id: "1",
    name: "John",
    email: "john@example.com",
    image: "https://github.com/shadcn.png?height=32&width=32",
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(true);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const historyData = [
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
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const handleRemoveHistory = async (historyId: string) => {
    try {
      console.log("Removing history item with ID:", historyId);
      setHistory((prevHistory) =>
        prevHistory.filter((item) => item._id !== historyId)
      );
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of what you watch
        </h2>
        <p className="text-gray-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No watch history yet</h2>
        <p className="text-gray-600">Videos you watch will appear here</p>
      </div>
    );
  }

  const videos = "/video/vdo.mp4";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{history.length} videos</p>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
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
                <DropdownMenuItem onClick={() => handleRemoveHistory(item._id)}>
                  <X className="w-4 h-4 mr-2" />
                  Remove from watch history
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryContent;
