"use client";

import React, { use, useState } from "react";
import VideoCall from "@/src/components/VideoCall";
import { Video } from "lucide-react";

type PageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default function MeetingRoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const [hasJoined, setHasJoined] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Meeting link copied! Send this to your friends.");
  };

  return (
    <div className="min-h-[90vh] bg-background text-foreground p-4 md:p-6 flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Live Meeting
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {roomId}
            </p>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Copy Invite Link
        </button>
      </div>

      <div className="grow w-full max-w-6xl mx-auto">
        {!hasJoined ? (
          <div className="flex justify-center items-center h-64">
            <button
              onClick={() => setHasJoined(true)}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg"
            >
              Join Meeting
            </button>
          </div>
        ) : (
          <VideoCall roomId={roomId} />
        )}
      </div>
    </div>
  );
}
