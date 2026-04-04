"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VideoPlayer from "@/src/components/VideoPlayer";
import VideoCall from "@/src/components/VideoCall";
import axiosInstance from "@/src/lib/AxiosInstance";

type PageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default function RoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");
  const router = useRouter();

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) {
      router.push("/");
      return;
    }

    const fetchVideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        const currentVideo = res.data?.find((vid: any) => vid._id === videoId);
        setVideo(currentVideo || null);
      } catch (error) {
        console.error("Failed to fetch video for room:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, router]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Watch Party link copied! Send this to your friends.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <h1 className="text-xl font-semibold animate-pulse">
          Entering Watch Party...
        </h1>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <h1 className="text-xl font-semibold">Video not found.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="grow lg:w-3/4 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                Live Watch Party
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                Room: {roomId}
              </p>
            </div>
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Copy Invite Link
            </button>
          </div>

          <div className="shadow-2xl shadow-black/10 dark:shadow-black/50 transition-shadow">
            <VideoPlayer video={video} roomId={roomId} />
          </div>

          <div className="bg-gray-100 dark:bg-gray-900/30 p-4 rounded-xl mt-2 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              {video.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-line transition-colors">
              {video.description}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/4 lg:min-w-[320px] lg:max-w-[400px]">
          <div className="sticky top-4">
            <h3 className="font-semibold mb-4 pl-2 text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 transition-colors">
              Meeting Participants
            </h3>
            <VideoCall roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}
