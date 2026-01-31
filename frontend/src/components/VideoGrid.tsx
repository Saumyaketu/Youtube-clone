"use client";
import React, { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import axiosInstance from "../lib/AxiosInstance";

const VideoGrid = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos(res.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading ? (
        <div>Loading...</div>
      ) : (
        videos.map((video: any) => <VideoCard key={video._id} video={video} />)
      )}
    </div>
  );
};

export default VideoGrid;
