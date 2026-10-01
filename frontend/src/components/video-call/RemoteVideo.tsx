"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

interface RemoteVideoProps {
  peer: Peer.Instance;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
}

export default function RemoteVideo({ peer, onVideoElement }: RemoteVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(() => {
    const peerWithStream = peer as Peer.Instance & { customStream?: MediaStream };
    return peerWithStream.customStream || peer.streams?.[0] || null;
  });

  useEffect(() => {
    const peerWithStream = peer as Peer.Instance & { customStream?: MediaStream };

    const handleStream = (incomingStream: MediaStream) => {
      peerWithStream.customStream = incomingStream;
      setStream(incomingStream);
    };

    peer.on("stream", handleStream);
    peer.on("track", (_track, incomingStream) => handleStream(incomingStream));
    peer.on("error", (error) => console.error("WebRTC Peer Error:", error));

    return () => {
      peer.removeListener("stream", handleStream);
      onVideoElement?.(null);
    };
  }, [onVideoElement, peer]);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-lg aspect-video flex items-center justify-center shadow-lg border border-gray-300 dark:border-gray-700">
        <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Connecting to peer...
        </span>
      </div>
    );
  }

  return (
    <video
      playsInline
      autoPlay
      ref={(element) => {
        ref.current = element;
        onVideoElement?.(element);
      }}
      className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors"
    />
  );
}
