"use client";
import Comments from "@/src/components/Comments";
import RelatedVideos from "@/src/components/RelatedVideos";
import VideoInfo from "@/src/components/VideoInfo";
import VideoPlayer from "@/src/components/VideoPlayer";
import axiosInstance from "@/src/lib/AxiosInstance";
import React, { useEffect, useState, use } from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const Page = ({ params }: PageProps) => {
  const { id } = use(params);

  const [videos, setVideos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get("/video/getall");
        const video = res.data?.find((vid:any) => vid._id == id);
        setVideo(video || null);
        setVideos(res.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  // const relatedVideos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 125,
  //     Dislike: 50,
  //     views: 450,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochanel: "Chef's Kitchen",
  //     Like: 90,
  //     Dislike: 20,
  //     views: 230,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];

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
            <RelatedVideos videos={videos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
