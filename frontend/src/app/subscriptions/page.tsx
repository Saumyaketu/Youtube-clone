"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import VideoCard from "@/src/components/VideoCard";
import { useUser } from "@/src/lib/AuthContext";
import {
  getSubscriptionVideos,
  getSubscriptions,
} from "@/src/lib/subscriptionApi";

type SubscriptionChannel = {
  _id: string;
  channelName?: string;
  image?: string;
};

type SubscriptionVideo = {
  _id: string;
  videotitle: string;
  videochannel: string;
  filepath: string;
  duration?: number;
  views: number;
  createdAt?: string;
};

const SubscriptionsPage = () => {
  const { user } = useUser();
  const [channels, setChannels] = useState<SubscriptionChannel[]>([]);
  const [videos, setVideos] = useState<SubscriptionVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const [subscriptionChannels, subscriptionVideos] = await Promise.all([
          getSubscriptions(user._id),
          getSubscriptionVideos(user._id),
        ]);
        setChannels(subscriptionChannels);
        setVideos(subscriptionVideos);
      } catch (fetchError) {
        console.error("Error fetching subscriptions:", fetchError);
        setError("Unable to load your subscriptions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user?._id]);

  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-semibold">Sign in to see your subscriptions</h1>
        <p className="text-muted-foreground">
          Follow channels to keep their latest videos in one place.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <h1 className="mb-6 text-2xl font-bold">Subscriptions</h1>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading subscriptions...</div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="text-xl font-semibold">No subscriptions yet</h2>
          <p className="text-muted-foreground">
            Subscribe to a channel and its latest videos will appear here.
          </p>
          <Link href="/explore">
            <Button>Explore channels</Button>
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Channels</h2>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {channels.map((channel) => (
                <Link
                  key={channel._id}
                  href={`/channel/${channel._id}`}
                  className="flex min-w-20 flex-col items-center gap-2"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={channel.image || undefined} alt={channel.channelName} />
                    <AvatarFallback>{channel.channelName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-24 truncate text-center text-sm">
                    {channel.channelName}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Latest videos</h2>
            {videos.length === 0 ? (
              <p className="py-8 text-muted-foreground">
                Your subscribed channels have not uploaded any videos yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default SubscriptionsPage;
