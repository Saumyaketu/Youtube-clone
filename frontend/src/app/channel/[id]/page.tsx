"use client";
import ChannelHeader from "@/src/components/ChannelHeader";
import ChannelTabs from "@/src/components/ChannelTabs";
import ChannelVideos from "@/src/components/ChannelVideos";
import VideoUploader from "@/src/components/VideoUploader";
import { useUser } from "@/src/lib/AuthContext";
import { notFound, useParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();

  if (!user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  try {
    let channel = user;
    if (!channel) {
      notFound();
    }

    const videos = [
      {
        _id: "1",
        videotitle: "Amazing Nature Documentary",
        filename: "nature-doc.mp4",
        filetype: "video/mp4",
        filepath: "/videos/nature-doc.mp4",
        filesize: "500MB",
        videochanel: "Nature Channel",
        Like: 1250,
        views: 45000,
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
        videochanel: "Chef's Kitchen",
        Like: 890,
        views: 23000,
        uploader: "chef_master",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return (
      <div className="flex-1 min-h-screen bg-white">
        <div className="max-w-full mx-auto">
          <ChannelHeader channel={channel} />
          <ChannelTabs />
          <div className="px-4 pb-8">
            <VideoUploader channelId={id} channelName={channel.channelName} />
          </div>
          <div className="px-4 pb-8">
            <ChannelVideos videos={videos} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching channel data:", error);
    notFound();
  }
};

export default page;
