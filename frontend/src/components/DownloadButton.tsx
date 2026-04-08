"use client";
import React, { useState } from "react";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/AxiosInstance";
import PremiumModal from "./PremiumModal";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const DownloadButton = ({ video }: { video: any }) => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!user) {
      alert("Please log in to download videos.");
      return;
    }

    try {
      setIsDownloading(true);

      const eligibilityRes = await axiosInstance.get(
        `/user/check-download/${user._id}`,
      );

      if (!eligibilityRes.data.allowed) {
        setIsModalOpen(true);
        setIsDownloading(false);
        return;
      }

      if (!("caches" in window)) {
        alert("Your browser does not support offline downloading.");
        setIsDownloading(false);
        return;
      }

      const videoUrl = video?.filepath?.startsWith("http")
        ? video.filepath
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`;

      const cache = await caches.open("youtube-offline-videos");
      const existingResponse = await cache.match(videoUrl);

      if (existingResponse) {
        alert("Video is already downloaded!");
        saveToLocal(video);
        setIsDownloading(false);
        return;
      }

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      await cache.put(videoUrl, response.clone());

      saveToLocal(video);

      await axiosInstance.post(`/user/track-download/${user._id}`);

      alert(
        "Download complete! You can view it in your Downloads page offline.",
      );
    } catch (error: any) {
      console.error("Download failed:", error);
      if (error.response?.status === 403) {
        setIsModalOpen(true);
      } else {
        alert("Failed to download video. Please try again.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const saveToLocal = (vid: any) => {
    const storedVideos = localStorage.getItem("offlineVideos");
    const offlineList = storedVideos ? JSON.parse(storedVideos) : [];
    if (!offlineList.some((v: any) => v._id === vid._id)) {
      offlineList.push(vid);
      localStorage.setItem("offlineVideos", JSON.stringify(offlineList));
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`bg-gray-100 rounded-full dark:bg-gray-800 ${
          isDownloading ? "opacity-70 cursor-wait" : ""
        }`}
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <Download
          className={`w-5 h-5 mr-2 ${isDownloading ? "animate-bounce" : ""}`}
        />
        {isDownloading ? "Downloading..." : "Download"}
      </Button>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature="download"
      />
    </>
  );
};

export default DownloadButton;
