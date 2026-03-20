"use client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "../lib/AuthContext";

const ChannelHeader = ({ channel }: any) => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);

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
            </div>
            {channel?.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id !== channel?._id && (
            <div className="flex gap-2">
                <Button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  variant={isSubscribed ? "outline" : "default"}
                  className={
                    isSubscribed
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
