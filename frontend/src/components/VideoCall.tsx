"use client";

import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";

interface VideoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: VideoCallProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const peerVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL || "",
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || "",
    },
  ];

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      secure: true,
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        socketRef.current?.emit("join-room", roomId);

        socketRef.current?.on("user-connected", (userId) => {
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: { iceServers },
          });

          peer.on("signal", (signal) => {
            socketRef.current?.emit("signal", {
              userToSignal: userId,
              callerID: socketRef.current?.id,
              signal,
            });
          });

          peer.on("stream", (peerStream) => {
            if (peerVideo.current) peerVideo.current.srcObject = peerStream;
          });

          connectionRef.current = peer;
        });

        socketRef.current?.on("signal", (data) => {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
            config: { iceServers },
          });

          peer.on("signal", (signal) => {
            socketRef.current?.emit("signal", {
              userToSignal: data.callerID,
              callerID: socketRef.current?.id,
              signal,
            });
          });

          peer.on("stream", (peerStream) => {
            if (peerVideo.current) peerVideo.current.srcObject = peerStream;
          });

          peer.signal(data.signal);
          connectionRef.current = peer;
        });

        socketRef.current?.on("user-disconnected", () => {
          console.log("Friend disconnected");
          if (peerVideo.current) {
            peerVideo.current.srcObject = null;
          }
          if (connectionRef.current) {
            connectionRef.current.destroy();
          }
        });

        socketRef.current?.on("room-full", () => {
          alert("This watch party is already full (max 2 people)!");
        });
      })
      .catch((error) => {
        console.error("Camera/Mic Permission Denied:", error);
        alert(
          "Please allow camera and microphone permissions to use the Watch Party feature!",
        );
      });

    return () => {
      socketRef.current?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      connectionRef.current?.destroy();
    };
  }, [roomId]);

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: true,
        } as any);
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const screenAudioTrack = screenStream.getAudioTracks()[0];

        if (connectionRef.current && stream) {
          const localVideoTrack = stream.getVideoTracks()[0];
          const localAudioTrack = stream.getAudioTracks()[0];

          connectionRef.current.replaceTrack(
            localVideoTrack,
            screenVideoTrack,
            stream,
          );

          if (screenAudioTrack) {
            connectionRef.current.replaceTrack(
              localAudioTrack,
              screenAudioTrack,
              stream,
            );
          }
        }

        if (myVideo.current) myVideo.current.srcObject = screenStream;
        setIsScreenSharing(true);

        screenVideoTrack.onended = () => stopScreenShare();
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      const localVideoTrack = stream.getVideoTracks()[0];
      const localAudioTrack = stream.getAudioTracks()[0];

      if (connectionRef.current) {
        const pc = (connectionRef.current as any)._pc;

        const videoSender = pc
          .getSenders()
          .find((s: any) => s.track?.kind === "video");
        if (videoSender) videoSender.replaceTrack(localVideoTrack);

        const audioSender = pc
          .getSenders()
          .find((s: any) => s.track?.kind === "audio");
        if (audioSender && localAudioTrack)
          audioSender.replaceTrack(localAudioTrack);
      }

      if (myVideo.current) myVideo.current.srcObject = stream;
      setIsScreenSharing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      recordedChunks.current = [];
      const streamToRecord = myVideo.current?.srcObject as MediaStream;
      if (!streamToRecord) return;

      const mediaRecorder = new MediaRecorder(streamToRecord, {
        mimeType: "video/webm",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = `youtube-session-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 rounded-xl">
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="relative">
          <span className="text-white bg-black/60 absolute z-10 px-2 py-1 m-2 rounded text-sm">
            You {isScreenSharing && "(Sharing Screen)"}
          </span>
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full bg-black rounded-lg aspect-video object-cover"
          />
        </div>
        <div className="relative">
          <span className="text-white bg-black/60 absolute z-10 px-2 py-1 m-2 rounded text-sm">
            Friend
          </span>
          <video
            playsInline
            ref={peerVideo}
            autoPlay
            className="w-full bg-black rounded-lg aspect-video object-cover"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={toggleScreenShare}
          className="px-6 py-2 font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {isScreenSharing ? "Stop Screen Share" : "Share YouTube Tab"}
        </button>

        <button
          onClick={toggleRecording}
          className={`px-6 py-2 font-semibold text-white rounded-md transition ${isRecording ? "bg-red-600 animate-pulse" : "bg-green-600 hover:bg-green-700"}`}
        >
          {isRecording ? "Stop & Save Recording" : "Start Recording"}
        </button>
      </div>
    </div>
  );
}
