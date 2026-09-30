"use client";
import ChannelHeader from "@/src/components/ChannelHeader";
import ChannelTabs from "@/src/components/ChannelTabs";
import ChannelVideos from "@/src/components/ChannelVideos";
import VideoUploader from "@/src/components/VideoUploader";
import { useUser } from "@/src/lib/AuthContext";
import axiosInstance from "@/src/lib/AxiosInstance";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Channel = {
  _id: string;
  channelName?: string;
  description?: string;
  image?: string;
};

type ChannelVideo = {
  _id: string;
  videotitle: string;
  videochannel: string;
  filepath: string;
  duration?: number;
  views: number;
  createdAt?: string;
};

const ChannelPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChannel = async () => {
      if (!id) return;

      try {
        const profileResponse = await axiosInstance.get(`/user/profile/${id}`);
        const profile = profileResponse.data.result as Channel;
        setChannel(profile);

        if (profile.channelName) {
          const videosResponse = await axiosInstance.get(
            `/video/getuservideos/${encodeURIComponent(profile.channelName)}`,
          );
          setVideos(videosResponse.data);
        }
      } catch (fetchError) {
        console.error("Error fetching channel:", fetchError);
        setError("Unable to load this channel.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">Loading channel...</div>;
  }

  if (error || !channel) {
    return <div className="p-4 text-center">{error || "Channel not found."}</div>;
  }

  const isOwner = user?._id === channel._id;

  return (
    <div className="flex-1 min-h-screen dark:bg-black-900 dark:text-white">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={channel} />
        <ChannelTabs />
        {isOwner && (
          <div className="px-4 pb-8">
            <VideoUploader channelId={channel._id} channelName={channel.channelName} />
          </div>
        )}
        <div className="px-4 pb-8">
          <ChannelVideos videos={videos} />
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;
