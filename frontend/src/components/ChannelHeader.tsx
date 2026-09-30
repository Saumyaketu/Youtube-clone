"use client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "../lib/AuthContext";
import {
  getSubscriberCount,
  getSubscriptionStatus,
  subscribe,
  unsubscribe,
} from "../lib/subscriptionApi";

type Channel = {
  _id?: string;
  channelName?: string;
  description?: string;
};

const ChannelHeader = ({ channel, isOwner, onEdit }: { channel: Channel; isOwner?: boolean; onEdit?: () => void }) => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (!channel?._id) return;

      try {
        setSubscriberCount(await getSubscriberCount(channel._id));
      } catch (error) {
        console.error("Error fetching subscriber count:", error);
      }
    };

    fetchSubscriberCount();
  }, [channel?._id]);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?._id || !channel?._id || user._id === channel._id) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        setIsSubscribed(await getSubscriptionStatus(user._id, channel._id));
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user?._id, channel?._id]);

  const handleSubscription = async () => {
    if (!user?._id || !channel?._id || isLoading) return;

    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe(user._id, channel._id);
        setIsSubscribed(false);
        setSubscriberCount((count) => Math.max(0, count - 1));
      } else {
        await subscribe(user._id, channel._id);
        setIsSubscribed(true);
        setSubscriberCount((count) => count + 1);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative h-32 md:h-48 lg:h-64 bg-linear-to-r from-blue-400 to-purple-500 dark:from-gray-800 dark:to-gray-700 overflow-hidden"></div>

      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-2xl dark:text-white">
              {channel?.channelName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold dark:text-white">
              {channel?.channelName}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                @{(channel?.channelName || "").toLowerCase().replace(/\s+/g, "")}
              </span>
              <span>{subscriberCount.toLocaleString()} subscribers</span>
            </div>
            {channel?.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl whitespace-pre-wrap break-words">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id === channel?._id ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onEdit}
                disabled={!onEdit}
              >
                Edit channel
              </Button>
            </div>
          ) : (
            user && user?._id !== channel?._id && (
              <div className="flex gap-2">
                  <Button
                    onClick={handleSubscription}
                    disabled={isLoading || isCheckingStatus}
                    variant={isSubscribed ? "outline" : "default"}
                    className={
                      isSubscribed
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {isLoading
                      ? "Updating..."
                      : isSubscribed
                        ? "Unsubscribe"
                        : "Subscribe"}
                  </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
