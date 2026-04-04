"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Video } from "lucide-react";

export default function VideoCallLobby() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");

  const startNewMeeting = () => {
    const newRoomId = `meet-${uuidv4().slice(0, 8)}`;
    router.push(`/video-call/${newRoomId}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;

    const roomId = joinId.includes("/") ? joinId.split("/").pop() : joinId;

    if (roomId) {
      router.push(`/video-call/${roomId}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-xl dark:shadow-2xl transition-colors">
        <div className="w-16 h-16 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Video Meetings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Connect, share your screen, and collaborate with friends in real-time.
        </p>

        <button
          onClick={startNewMeeting}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-600/20 dark:shadow-blue-600/30 mb-6"
        >
          New Meeting
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="shrink-0 mx-4 text-gray-500 dark:text-gray-400 text-sm">
            or join an existing one
          </span>
          <div className="grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room ID or Link"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="grow px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={!joinId.trim()}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-white font-semibold rounded-lg transition"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
