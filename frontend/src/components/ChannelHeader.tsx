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
      <div className="relative h-32 md:h-48 lg:h-64 bg-linear-to-r from-blue-400 to-purple-500 overflow-hidden"></div>

      <div className="px-4 py-6">
        <div className="flex felx-col md:flex-row gap-6 items-start">
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-2xl">
              {channel.name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">{channel.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>@{channel.name.toLowerCase().replace(/\s+/g, "")}</span>
            </div>
            {channel.description && (
              <p className="text-sm text-gray-700 max-w-2xl">
                {channel.description}
              </p>
            )}
          </div>

          {user && user.id !== channel.id && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsSubscribed(!isSubscribed)}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"
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
