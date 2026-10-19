"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

interface RemoteVideoProps {
  peer: Peer.Instance;
  onVideoElement?: (element: HTMLVideoElement | null) => void;
}

export default function RemoteVideo({ peer, onVideoElement }: RemoteVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const onVideoElementRef = useRef(onVideoElement);

  useEffect(() => {
    onVideoElementRef.current = onVideoElement;
  }, [onVideoElement]);

  const [stream, setStream] = useState<MediaStream | null>(() => {
    const peerWithStream = peer as Peer.Instance & {
      customStream?: MediaStream;
      _remoteStream?: MediaStream;
    };
    return peerWithStream._remoteStream || peerWithStream.customStream || peer.streams?.[0] || null;
  });

  useEffect(() => {
    const peerWithStream = peer as Peer.Instance & {
      customStream?: MediaStream;
      _remoteStream?: MediaStream;
    };

    if (peerWithStream._remoteStream || peerWithStream.customStream) {
      setStream(peerWithStream._remoteStream || peerWithStream.customStream || null);
    }

    const handleStream = (incomingStream: MediaStream) => {
      peerWithStream.customStream = incomingStream;
      peerWithStream._remoteStream = incomingStream;
      setStream(incomingStream);
    };

    const handleTrack = (_track: MediaStreamTrack, incomingStream: MediaStream) => {
      handleStream(incomingStream);
    };

    const handleError = (error: Error) => {
      console.error("WebRTC Peer Error:", error);
    };

    peer.on("stream", handleStream);
    peer.on("track", handleTrack);
    peer.on("error", handleError);

    return () => {
      peer.removeListener("stream", handleStream);
      peer.removeListener("track", handleTrack);
      peer.removeListener("error", handleError);
      onVideoElementRef.current?.(null);
    };
  }, [peer]);

  useEffect(() => {
    if (ref.current && stream) {
      if (ref.current.srcObject !== stream) {
        ref.current.srcObject = stream;
      }
      ref.current.play().catch((err) => {
        console.warn("Autoplay was prevented by browser:", err);
      });
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
        if (element && stream && element.srcObject !== stream) {
          element.srcObject = stream;
          element.play().catch(() => {});
        }
        onVideoElementRef.current?.(element);
      }}
      className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors"
    />
  );
}
