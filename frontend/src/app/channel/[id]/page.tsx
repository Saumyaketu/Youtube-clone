import ChannelHeader from "@/src/components/ChannelHeader";
import ChannelTabs from "@/src/components/ChannelTabs";
import ChannelVideos from "@/src/components/ChannelVideos";
import VideoUploader from "@/src/components/VideoUploader";
import { notFound } from "next/navigation";
import React from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  // const user: any = {
  //   id: "1",
  //   name: "John",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };

  try {
    let channel = {
      id: id,
      name: "Tech Channel",
      email: "tech@example.com",
      description:
        "Welcome to our tech channel! We cover the latest in technology, reviews and tutorials.",
      joinedOn: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
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
            <VideoUploader channelId={id} channelName={channel.name} />
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
