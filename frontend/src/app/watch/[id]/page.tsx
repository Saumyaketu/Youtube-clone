"use client";
import Comments from "@/src/components/Comments";
import RelatedVideos from "@/src/components/RelatedVideos";
import VideoInfo from "@/src/components/VideoInfo";
import VideoPlayer from "@/src/components/VideoPlayer";
import axiosInstance from "@/src/lib/AxiosInstance";
import { useUser } from "@/src/lib/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, use, useRef } from "react";

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
  const router = useRouter();

  const [videos, setVideos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const commentsRef = useRef<HTMLDivElement>(null);

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

  const handleNextVideo = () => {
    if (!videos || videos.length === 0) return;

    const currentIndex = videos.findIndex((v: any) => v._id === id || v === id);

    if (currentIndex !== -1 && currentIndex + 1 < videos.length) {
      const nextVid = videos[currentIndex + 1];
      const nextId = nextVid._id || nextVid;
      let url = `/watch/${nextId}`;
      if (listType) url += `?list=${listType}`;
      router.push(url);
    }
  };

  const handleShowComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer
              video={video}
              onNextVideo={handleNextVideo}
              onShowComments={handleShowComments}
            />
            <VideoInfo video={video} />
            <div ref={commentsRef}>
              <Comments videoId={id} />
            </div>
          </div>
          
          <div className="space-y-4">
            {(listType === "liked" || listType === "wl") && (
              <div className="bg-popover p-3 rounded-lg mb-2">
                <h3 className="font-semibold text-sm">
                  {listType === "liked"
                    ? "Liked Videos Queue"
                    : "Watch Later Queue"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {videos.length} videos
                </p>
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
