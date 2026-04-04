"use client";

import React, { useEffect, useRef, useState } from "react";
// import axiosInstance from "@/src/lib/AxiosInstance";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";

interface VideoCallProps {
  roomId: string;
}

const Video = ({ peer }: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (peer.streams && peer.streams.length > 0) {
      if (ref.current) ref.current.srcObject = peer.streams[0];
    }
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
    peer.on("error", (err) => console.error("WebRTC Peer Error:", err));
  }, [peer]);

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors"
    />
  );
};

export default function VideoCall({ roomId }: VideoCallProps) {
  const [peers, setPeers] = useState<{ peerID: string; peer: Peer.Instance }[]>(
    [],
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // const turnRes = await axiosInstance.get("/turn");
        const secureIceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // ...turnRes.data,
        ];

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
          secure: true,
        });

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        socketRef.current.on("all-users", (usersInRoom: string[]) => {
          const peersList: { peerID: string; peer: Peer.Instance }[] = [];
          usersInRoom.forEach((userID) => {
            const mySocketId = socketRef.current?.id || "";
            const peer = createPeer(
              userID,
              mySocketId,
              currentStream,
              secureIceServers,
            );
            peersRef.current.push({ peerID: userID, peer });
            peersList.push({ peerID: userID, peer });
          });
          setPeers(peersList);
        });

        socketRef.current.on("user-joined", (payload) => {
          const peer = addPeer(
            payload.signal,
            payload.callerID,
            currentStream,
            secureIceServers,
          );
          peersRef.current.push({ peerID: payload.callerID, peer });
          setPeers((users) => [...users, { peerID: payload.callerID, peer }]);
        });

        socketRef.current.on("receiving-returned-signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) item.peer.signal(payload.signal);
        });

        socketRef.current.on("user-disconnected", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) peerObj.peer.destroy();
          const peersList = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peersList;
          setPeers(peersList);
        });

        socketRef.current.on("connect", () => {
          socketRef.current?.emit("join-room", roomId);
        });

        if (socketRef.current.connected) {
          socketRef.current.emit("join-room", roomId);
        }
      } catch (error) {
        console.error("Initialization Failed:", error);
        alert(
          "Please allow camera and microphone permissions to join the meeting.",
        );
      }
    };

    initializeCall();

    return () => {
      socketRef.current?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      peersRef.current.forEach(({ peer }) => peer.destroy());
    };
  }, [roomId]);

  function createPeer(
    userToSignal: string,
    callerID: string,
    stream: MediaStream,
    iceServers: any,
  ) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers },
    });
    peer.on("signal", (signal) => {
      socketRef.current?.emit("sending-signal", {
        userToSignal,
        callerID,
        signal,
      });
    });
    return peer;
  }

  function addPeer(
    incomingSignal: any,
    callerID: string,
    stream: MediaStream,
    iceServers: any,
  ) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { iceServers },
    });
    peer.on("signal", (signal) => {
      socketRef.current?.emit("returning-signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        if (stream) {
          const localVideoTrack = stream.getVideoTracks()[0];
          peersRef.current.forEach(({ peer }) => {
            peer.replaceTrack(localVideoTrack, screenVideoTrack, stream);
          });
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

      peersRef.current.forEach(({ peer }) => {
        const pc = (peer as any)._pc;
        const videoSender = pc
          .getSenders()
          .find((s: any) => s.track?.kind === "video");
        if (videoSender) videoSender.replaceTrack(localVideoTrack);
      });

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
        a.href = url;
        a.download = `watch-party-recording-${new Date().toISOString()}.webm`;
        a.click();
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
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 gap-3 w-full">
        <div className="relative">
          <span className="text-gray-900 bg-white/80 dark:text-white dark:bg-black/60 absolute z-10 px-2 py-1 m-2 rounded text-xs shadow-md backdrop-blur-sm">
            You {isScreenSharing && "(Sharing Screen)"}
          </span>
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors"
          />
        </div>

        {peers.map((peerObj) => (
          <div
            key={peerObj.peerID}
            className="relative transition-all duration-300 animate-in fade-in zoom-in-95"
          >
            <span className="text-gray-900 bg-white/80 dark:text-white dark:bg-black/60 absolute z-10 px-2 py-1 m-2 rounded text-xs shadow-md backdrop-blur-sm">
              Participant
            </span>
            <Video peer={peerObj.peer} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={toggleScreenShare}
          className="w-full py-2 text-sm font-semibold bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition"
        >
          {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        </button>

        <button
          onClick={toggleRecording}
          className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${
            isRecording
              ? "bg-red-600 animate-pulse"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRecording ? "Stop Recording" : "Record Local View"}
        </button>
      </div>
    </div>
  );
}
