"use client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axiosInstance from "../lib/AxiosInstance";

const formatDuration = (duration: any) => {
  const seconds = parseFloat(duration);
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SearchResult = ({ query }: any) => {
  if (!query || !query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">Enter a search term to find videos</p>
      </div>
    );
  }

  const [video, setVideo] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        const allVideos = res.data;
        const lowerQuery = query.toLowerCase();

        const results = allVideos.filter(
          (vid: any) =>
            vid.videotitle?.toLowerCase().includes(lowerQuery) ||
            vid.videochannel?.toLowerCase().includes(lowerQuery),
        );

        setVideo(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setVideo([]);
      }
    };

    fetchVideos();
  }, [query]);

  if (video === null) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-300">Loading results...</div>
    );
  }

    if (video.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold mb-2 dark:text-white">No results found</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {video.length > 0 && (
        <div className="space-y-4">
          {video.map((item: any) => {
            const isCloudinary = item?.filepath?.startsWith("http");
            const thumbnailUrl = isCloudinary
              ? item.filepath.replace(/\.(mp4|mkv|webm|avi)$/i, ".jpg")
              : "/file.svg";

            return (
              <div key={item._id} className="flex gap-4 group">
                <Link href={`/watch/${item._id}`} className="shrink-0">
                  <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-800">
                    <img
                      src={thumbnailUrl}
                      alt={item.videotitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                      {formatDuration(item.duration)}
                    </div>
                  </div>
                </Link>

                <div className="flex-1 min-w-0 py-1">
                  <Link href={`/watch/${item._id}`}>
                    <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                      {item.videotitle}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{item.views?.toLocaleString() || 0} views •</span>
                    <span>
                      {item.createdAt
                        ? formatDistanceToNow(new Date(item.createdAt))
                        : "Just now"}{" "}
                      ago
                    </span>
                  </div>

                  <Link
                    href={`/channel/${item.uploader}`}
                    className="flex items-center gap-2 mb-2 hover:text-blue-600"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" />
                      <AvatarFallback className="text-xs dark:text-white">
                        {item.videochannel?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {item.videochannel}
                    </span>
                  </Link>

                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {item.description || "No description available."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300">
          Showing {video.length} results for "{query}"
        </p>
      </div>
    </div>
  );
};

export default SearchResult;
