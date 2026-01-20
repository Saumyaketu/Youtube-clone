"use client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SearchResult = ({ query }: any) => {
  if (!query || !query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Enter a search term to find videos</p>
      </div>
    );
  }

  const [video, setVideo] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchVideos = () => {
      const allVideos = [
        {
          _id: "1",
          videotitle: "Amazing Nature Documentary",
          filename: "nature-doc.mp4",
          filetype: "video/mp4",
          filepath: "/videos/nature-doc.mp4",
          filesize: "500MB",
          videochannel: "Nature Channel",
          Like: 125,
          views: 450,
          uploader: "nature_lover",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          videotitle: "Cooking Tutorial: Perfect Pasta",
          filename: "pasta-tutorial.mp4",
          filetype: "video/mp4",
          filepath: "/videos/pasta-tutorial.mp4",
          filesize: "300MB",
          videochannel: "Chef's Kitchen",
          Like: 90,
          views: 230,
          uploader: "chef_master",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      const lowerQuery = query.toLowerCase();

      const results = allVideos.filter(
        (vid) =>
          vid.videotitle.toLowerCase().includes(lowerQuery) ||
          vid.videochannel.toLowerCase().includes(lowerQuery),
      );
      setVideo(results);
    };

    fetchVideos();
  }, [query]);

  if (video === null) {
    return (
      <div className="text-center py-12 text-gray-500">Loading results...</div>
    );
  }

  if (video.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold mb-2">No results found</h1>
        <p className="text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  const vids = "/video/vdo.mp4";
  return (
    <div className="space-y-6">
      {video.length > 0 && (
        <div className="space-y-4">
          {video.map((item: any) => (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${item._id}`} className="shrink-0">
                <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={vids}
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                    10:24
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
                  <span>{item.views.toLocaleString()} views •</span>
                  <span>
                    {formatDistanceToNow(new Date(item.createdAt))} ago
                  </span>
                </div>

                <Link
                  href={`/channel/${item.uploader}`}
                  className="flex items-center gap-2 mb-2 hover:text-blue-600"
                >
                  <Avatar className="w-6h-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback className="text-xs">
                      {item.videochannel[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {item.videochannel}
                  </span>
                </Link>

                <p className="text-sm text-gray-700 line-clamp-2">
                  Sample video description that would show search-relevant
                  content and help users understand what the video is about
                  before clicking.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center py-8">
        <p className="text-gray-600">
          Showing {video.length} results for "{query}"
        </p>
      </div>
    </div>
  );
};

export default SearchResult;
