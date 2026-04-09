"use client";
import React, { useEffect, useState } from "react";
import VideoCard from "@/src/components/VideoCard";
import { Download, Trash2 } from "lucide-react";

const DownloadsPage = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOfflineVideos = () => {
      const stored = localStorage.getItem("offlineVideos");
      if (stored) {
        try {
          setVideos(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse offline videos", error);
        }
      }
      setLoading(false);
    };

    loadOfflineVideos();
  }, []);

  const removeDownload = async (videoId: string, videoUrl: string) => {
    const updatedVideos = videos.filter((v) => v._id !== videoId);
    setVideos(updatedVideos);
    localStorage.setItem("offlineVideos", JSON.stringify(updatedVideos));

    if ("caches" in window) {
      try {
        const cache = await caches.open("youtube-offline-videos");
        await cache.delete(videoUrl);
        console.log("Video permanently removed from offline storage.");
      } catch (error) {
        console.error("Failed to remove video from cache", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">Loading your library...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Offline Downloads</h1>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <Download className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No videos downloaded yet.</p>
            <p className="text-sm">
              Videos you download will appear here for offline viewing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => {
              const videoUrl = video?.filepath?.startsWith("http")
                ? video.filepath
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`;

              return (
                <div key={video._id} className="relative group">
                  <VideoCard video={video} />

                  <button
                    onClick={() => removeDownload(video._id, videoUrl)}
                    className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-red-700"
                    title="Remove from downloads"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;
