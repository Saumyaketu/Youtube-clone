"use client";
import Comments from "@/src/components/Comments";
import RelatedVideos from "@/src/components/RelatedVideos";
import VideoInfo from "@/src/components/VideoInfo";
import VideoPlayer from "@/src/components/VideoPlayer";
import axiosInstance from "@/src/lib/AxiosInstance";
import { useUser } from "@/src/lib/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, use, useRef } from "react";
import VideoCall from "@/src/components/VideoCall";
import { v4 as uuidv4 } from "uuid";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const partyId = searchParams.get("party");
  const listType = searchParams.get("list");
  const { user } = useUser();
  const router = useRouter();

  const [videos, setVideos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(!!partyId);
  const [callRoomId, setCallRoomId] = useState(
    partyId || `party-${uuidv4().slice(0, 8)}`,
  );

  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFromLocalStorage = () => {
      console.warn("Loading from Local Storage instantly...");
      const stored = localStorage.getItem("offlineVideos");
      if (stored) {
        const offlineVideos = JSON.parse(stored);
        const currentOfflineVideo = offlineVideos.find(
          (vid: any) => vid._id === id,
        );

        if (currentOfflineVideo) {
          setVideo(currentOfflineVideo);
          setVideos(offlineVideos);
        }
      }
      setLoading(false);
    };

    const fetchVideo = async () => {
      if (!id || typeof id !== "string") return;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        loadFromLocalStorage();
        return;
      }

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
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id, listType, user]);

  useEffect(() => {
    if (showVideoCall && !partyId) {
      const newUrl = `/watch/${id}?party=${callRoomId}${listType ? `&list=${listType}` : ""}`;
      window.history.replaceState(
        { ...window.history.state, as: newUrl, url: newUrl },
        "",
        newUrl,
      );
    }
  }, [showVideoCall, callRoomId, id, partyId, listType]);

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
        <div className="grid grid-cols-1 lg:flex lg:items-start lg:gap-6 gap-6">
          <div className="lg:flex-1 space-y-4">
            <VideoPlayer
              video={video}
              onNextVideo={handleNextVideo}
              onShowComments={handleShowComments}
              roomId={showVideoCall ? callRoomId : null}
            />
            <VideoInfo video={video} />

            <div className="mt-4 mb-4 flex justify-end">
              <button
                onClick={() => {
                  const newRoomId = `party-${uuidv4().slice(0, 8)}`;
                  router.push(`/room/${newRoomId}?v=${id}`);
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                🍿 Start Watch Party
              </button>
            </div>

            {showVideoCall && <VideoCall roomId={callRoomId} />}

            <div ref={commentsRef}>
              <Comments videoId={id} />
            </div>
          </div>

          <div className="space-y-4 lg:w-90">
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
