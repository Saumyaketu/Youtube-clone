"use client";
import ChannelHeader from "@/src/components/ChannelHeader";
import ChannelTabs from "@/src/components/ChannelTabs";
import ChannelVideos from "@/src/components/ChannelVideos";
import VideoUploader from "@/src/components/VideoUploader";
import { useUser } from "@/src/lib/AuthContext";
import axios from "axios";
import { notFound, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (user?.channelName) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/video/getuservideos/${user.channelName}`
          );
          setVideos(response.data);
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      }
    };

    fetchVideos();
  }, [user]);

  if (!user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  try {
    let channel = user;
    if (!channel) {
      notFound();
    }

    return (
      <div className="flex-1 min-h-screen dark:bg-black-900 dark:text-white">
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
