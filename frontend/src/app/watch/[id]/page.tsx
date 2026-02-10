"use client";
import Comments from "@/src/components/Comments";
import RelatedVideos from "@/src/components/RelatedVideos";
import VideoInfo from "@/src/components/VideoInfo";
import VideoPlayer from "@/src/components/VideoPlayer";
import axiosInstance from "@/src/lib/AxiosInstance";
import { useUser } from "@/src/lib/AuthContext";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, use } from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const listType = searchParams.get("list");
  const { user } = useUser();

  const [videos, setVideos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const allVideosRes = await axiosInstance.get("/video/getall");
        const currentVideo = allVideosRes.data?.find(
          (vid: any) => vid._id == id,
        );
        setVideo(currentVideo || null);

        if (listType === "liked" && user?._id) {
          const likedRes = await axiosInstance.get(`/like/${user._id}`);

          const formattedQueue = likedRes.data.map((item: any) => item.videoid);
          setVideos(formattedQueue);
        } else if (listType === "wl") {
          try {
            const wlRes = await axiosInstance.get(`/watch/${user._id}`);
            const formattedQueue = wlRes.data
              .filter((item: any) => item.videoid !== null)
              .map((item: any) => item.videoid);
            setVideos(formattedQueue);
          } catch (error) {
            console.error("Error fetching watch later:", error);
          }
        } else {
          setVideos(allVideosRes.data);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id, listType, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">Video Not Found</h1>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} />
            <VideoInfo video={video} />
            <Comments videoId={id} />
          </div>
          <div className="space-y-4">
            {(listType === "liked" || listType === "wl") && (
              <div className="bg-gray-100 p-3 rounded-lg mb-2">
                <h3 className="font-semibold text-sm">
                  {listType === "liked"
                    ? "Liked Videos Queue"
                    : "Watch Later Queue"}
                </h3>
                <p className="text-xs text-gray-500">{videos.length} videos</p>
              </div>
            )}
            <RelatedVideos videos={videos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
