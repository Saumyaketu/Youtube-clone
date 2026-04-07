"use client";

import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import { Maximize2, Minimize2 } from 'lucide-react';

interface VideoCallProps {
  roomId: string;
}

const Video = ({ peer }: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if ((peer as any).customStream) {
      setStream((peer as any).customStream);
    } else if (peer.streams && peer.streams.length > 0) {
      setStream(peer.streams[0]);
    }

    peer.on("stream", (incomingStream) => {
      (peer as any).customStream = incomingStream;
      setStream(incomingStream);
    });

    peer.on("track", (track, incomingStream) => {
      (peer as any).customStream = incomingStream;
      setStream(incomingStream);
    });

    peer.on("error", (err) => console.error("WebRTC Peer Error:", err));
  }, [peer]);

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
  const [isMobile, setIsMobile] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [pinnedUser, setPinnedUser] = useState<string | null>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    let isMounted = true;

    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    const initializeCall = async () => {
      try {
        const secureIceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls:  process.env.NEXT_PUBLIC_TURN_URL || "turn:openrelay.metered.ca:80",
            username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
          },
          {
            urls: process.env.NEXT_PUBLIC_TURN_URL_SECURE || "turn:openrelay.metered.ca:443",
            username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
          },
          {
            urls: (process.env.NEXT_PUBLIC_TURN_URL_SECURE || "turn:openrelay.metered.ca:443") + "?transport=tcp",
            username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
          },
        ];

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 26 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isMounted) {
          currentStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
        socketRef.current = io(SOCKET_URL, {
          transports: ["polling", "websocket"],
          secure: true,
        });

        socketRef.current.on("connect", () => {
          socketRef.current?.emit("join-room", roomId);
        });

        socketRef.current.on("all-users", (usersInRoom: string[]) => {
          const peersList: { peerID: string; peer: Peer.Instance }[] = [];
          usersInRoom.forEach((userID) => {
            if (userID === socketRef.current?.id) return;
            if (peersRef.current.find((p) => p.peerID === userID)) return;

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
          if (peersList.length > 0) {
            setPeers((prev) => {
              const safeToAdd = peersList.filter(
                (newPeer) =>
                  !prev.some((existing) => existing.peerID === newPeer.peerID),
              );
              return [...prev, ...safeToAdd];
            });
          }
        });

        socketRef.current.on("user-joined", (payload) => {
          if (payload.callerID === socketRef.current?.id) return;

          const existingPeerObj = peersRef.current.find(
            (p) => p.peerID === payload.callerID,
          );
          if (existingPeerObj) {
            if (!existingPeerObj.peer.destroyed) {
              existingPeerObj.peer.signal(payload.signal);
            }
            return;
          }

          const peer = addPeer(
            payload.signal,
            payload.callerID,
            currentStream,
            secureIceServers,
          );
          peersRef.current.push({ peerID: payload.callerID, peer });
          setPeers((prev) => {
            if (prev.some((p) => p.peerID === payload.callerID)) return prev;
            return [...prev, { peerID: payload.callerID, peer }];
          });
        });

        socketRef.current.on("receiving-returned-signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item && !item.peer.destroyed) {
            item.peer.signal(payload.signal);
          }
        });

        socketRef.current.on("user-disconnected", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj && !peerObj.peer.destroyed) peerObj.peer.destroy();

          const peersList = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peersList;
          setPeers(peersList);
        });
      } catch (error) {
        console.error("Initialization Failed:", error);
        alert(
          "Please allow camera and microphone permissions to join the meeting.",
        );
      }
    };

    initializeCall();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();

      if (myVideo.current && myVideo.current.srcObject) {
        const mediaStream = myVideo.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach((track) => track.stop());
        myVideo.current.srcObject = null;
      }

      peersRef.current.forEach(({ peer }) => {
        if (!peer.destroyed) peer.destroy();
      });
      peersRef.current = [];
      setPeers([]);
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
      trickle: true,
      stream,
      config: { iceServers },
    });

    peer.on("stream", (incomingStream) => {
      (peer as any).customStream = incomingStream;
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
      trickle: true,
      stream,
      config: { iceServers },
    });
    peer.on("stream", (incomingStream) => {
      (peer as any).customStream = incomingStream;
    });

    peer.on("signal", (signal) => {
      socketRef.current?.emit("returning-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    socketRef.current?.disconnect();
    if (myVideo.current?.srcObject) {
      const mediaStream = myVideo.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    window.location.href = "/";
  };

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

      const screenStream = myVideo.current?.srcObject as MediaStream;
      if (screenStream && screenStream !== stream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }

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

      let mimeType = "";
      if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9")) {
        mimeType = "video/webm; codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      }

      const options = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(streamToRecord, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blobType = mimeType || "video/mp4";
        const blob = new Blob(recordedChunks.current, { type: blobType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const extension = blobType.includes("mp4") ? "mp4" : "webm";
        a.download = `watch-party-recording-${new Date().toISOString()}.${extension}`;

        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
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
      <div 
        className={`grid gap-3 w-full place-content-center mx-auto max-w-7xl transition-all duration-300 ${
          pinnedUser 
            ? "grid-cols-[repeat(auto-fit,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]" 
            : "grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]"
        }`}
      >
        
        <div className={`relative group overflow-hidden transition-all duration-300 ${
          pinnedUser === "local" ? "col-span-full order-first w-full md:w-[85%] mx-auto" : "order-0"
        }`}>
          <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-gray-900 bg-white/80 dark:text-white dark:bg-black/60 absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs shadow-md backdrop-blur-sm">
            You {isScreenSharing && "(Sharing Screen)"} {isMuted && "(Muted)"}
          </span>
          
          <button 
             onClick={() => setPinnedUser(pinnedUser === "local" ? null : "local")}
             className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md backdrop-blur-md shadow-lg border border-white/10"
             title={pinnedUser === "local" ? "Shrink video" : "Expand video"}
          >
             {pinnedUser === "local" ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
          </button>

          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className={`w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors ${!isScreenSharing && !isVideoOff ? "-scale-x-100" : ""}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg pointer-events-none">
              <p className="text-white font-bold text-lg">Camera Off</p>
            </div>
          )}
        </div>

        {peers.map((peerObj) => (
          <div
            key={peerObj.peerID}
            className={`relative group overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
              pinnedUser === peerObj.peerID ? "col-span-full order-first w-full md:w-[85%] mx-auto" : "order-0"
            }`}
          >
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-gray-900 bg-white/80 dark:text-white dark:bg-black/60 absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs shadow-md backdrop-blur-sm">
              Participant
            </span>

            <button 
               onClick={() => setPinnedUser(pinnedUser === peerObj.peerID ? null : peerObj.peerID)}
               className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md backdrop-blur-md shadow-lg border border-white/10"
               title={pinnedUser === peerObj.peerID ? "Shrink video" : "Expand video"}
            >
               {pinnedUser === peerObj.peerID ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
            </button>

            <Video peer={peerObj.peer} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
        <button
          onClick={toggleMute}
          className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}`}
        >
          {isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
        </button>

        {!isMobile && (
          <button
            onClick={toggleScreenShare}
            className="w-full py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          </button>
        )}

        <button
          onClick={toggleRecording}
          className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isRecording ? "bg-red-600 animate-pulse" : "bg-green-600 hover:bg-green-700"}`}
        >
          {isRecording ? "Stop Recording" : "Record Local"}
        </button>

        <button
          onClick={endCall}
          className="w-full py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition md:col-span-1 col-span-2"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
