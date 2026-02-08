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
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";

interface Video {
  _id: string;
  videotitle: string;
  videochannel: string;
  views: number;
  createdAt: string;
  filename: string;
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

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Keep track of videos you like
        </h2>
        <p className="text-gray-600">Sign in to see your liked videos</p>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
        <p className="text-gray-600">Videos you like will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        {likes.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoid._id}`} className="shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${item.videoid.filename}`}
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
              <p className="text-xs text-gray-500 mt-1">
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveLike(item.videoid._id, item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from liked videos history
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedContent;
