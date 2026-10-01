"use client";

import { useEffect, useRef, useState } from "react";
import io, { type Socket } from "socket.io-client";
import Peer from "simple-peer";

export type CallPeer = { peerID: string; peer: Peer.Instance };

type UseVideoCallResult = {
  peers: CallPeer[];
  stream: MediaStream | null;
  myVideo: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRefs: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingError: string | null;
  isMobile: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleRecording: () => void;
  endCall: () => void;
};

export function useVideoCall(roomId: string): UseVideoCallResult {
  const [peers, setPeers] = useState<CallPeer[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<CallPeer[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingMimeTypeRef = useRef("video/webm");
  const afterRecordingStopRef = useRef<(() => void) | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);
  const remoteVideoRefs = useRef(new Map<string, HTMLVideoElement>());
  const recordingAnimationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      {
        urls: process.env.NEXT_PUBLIC_TURN_URL || "turn:openrelay.metered.ca:80",
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
      },
      {
        urls: process.env.NEXT_PUBLIC_TURN_URL_SECURE || "turn:openrelay.metered.ca:443",
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "openrelayproject",
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "openrelayproject",
      },
    ];

    const addPeerToState = (peerID: string, peer: Peer.Instance) => {
      peersRef.current.push({ peerID, peer });
      setPeers((current) =>
        current.some((item) => item.peerID === peerID)
          ? current
          : [...current, { peerID, peer }],
      );
    };

    const createPeer = (userToSignal: string, callerID: string, localStream: MediaStream) => {
      const peer = new Peer({ initiator: true, trickle: true, stream: localStream, config: { iceServers } });
      peer.on("signal", (signal) => {
        socketRef.current?.emit("sending-signal", { userToSignal, callerID, signal });
      });
      return peer;
    };

    const addPeer = (incomingSignal: Peer.SignalData, callerID: string, localStream: MediaStream) => {
      const peer = new Peer({ initiator: false, trickle: true, stream: localStream, config: { iceServers } });
      peer.on("signal", (signal) => {
        socketRef.current?.emit("returning-signal", { signal, callerID });
      });
      peer.signal(incomingSignal);
      return peer;
    };

    const initializeCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640, max: 1280 }, height: { ideal: 480, max: 720 }, frameRate: { ideal: 24, max: 26 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });

        if (!isMounted) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(localStream);
        if (myVideo.current) myVideo.current.srcObject = localStream;

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
          transports: ["polling", "websocket"],
          secure: true,
        });
        socketRef.current = socket;
        socket.on("connect", () => socket.emit("join-room", `call:${roomId}`));
        socket.on("all-users", (userIDs: string[]) => {
          const socketID = socket.id;
          if (!socketID) return;
          userIDs.forEach((userID) => {
            if (userID === socketID || peersRef.current.some((item) => item.peerID === userID)) return;
            addPeerToState(userID, createPeer(userID, socketID, localStream));
          });
        });
        socket.on("user-joined", (payload) => {
          if (payload.callerID === socket.id) return;
          const existing = peersRef.current.find((item) => item.peerID === payload.callerID);
          if (existing) {
            if (!existing.peer.destroyed) existing.peer.signal(payload.signal);
            return;
          }
          addPeerToState(payload.callerID, addPeer(payload.signal, payload.callerID, localStream));
        });
        socket.on("receiving-returned-signal", (payload) => {
          const item = peersRef.current.find((peer) => peer.peerID === payload.id);
          if (item && !item.peer.destroyed) item.peer.signal(payload.signal);
        });
        socket.on("user-disconnected", (peerID: string) => {
          const item = peersRef.current.find((peer) => peer.peerID === peerID);
          if (item && !item.peer.destroyed) item.peer.destroy();
          peersRef.current = peersRef.current.filter((peer) => peer.peerID !== peerID);
          remoteVideoRefs.current.delete(peerID);
          setPeers((current) => current.filter((peer) => peer.peerID !== peerID));
        });
      } catch (error) {
        console.error("Initialization Failed:", error);
        alert("Please allow camera and microphone permissions to join the meeting.");
      }
    };

    void initializeCall();
    const localVideo = myVideo.current;
    const remoteVideos = remoteVideoRefs.current;
    return () => {
      isMounted = false;
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      socketRef.current?.disconnect();
      const localStream = localVideo?.srcObject as MediaStream | null;
      localStream?.getTracks().forEach((track) => track.stop());
      if (localVideo) localVideo.srcObject = null;
      peersRef.current.forEach(({ peer }) => {
        if (!peer.destroyed) peer.destroy();
      });
      peersRef.current = [];
      remoteVideos.clear();
      setPeers([]);
    };
  }, [roomId]);

  const toggleMute = () => {
    const track = stream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsVideoOff(!track.enabled);
  };

  const stopScreenShare = () => {
    if (!stream) return;
    const localVideoTrack = stream.getVideoTracks()[0];
    const screenStream = myVideo.current?.srcObject as MediaStream | null;
    if (screenStream && screenStream !== stream) screenStream.getTracks().forEach((track) => track.stop());
    peersRef.current.forEach(({ peer }) => {
      const connection = (peer as Peer.Instance & { _pc?: RTCPeerConnection })._pc;
      const sender = connection?.getSenders().find((item) => item.track?.kind === "video");
      if (sender) void sender.replaceTrack(localVideoTrack);
    });
    if (myVideo.current) myVideo.current.srcObject = stream;
    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (stream) {
        const localVideoTrack = stream.getVideoTracks()[0];
        peersRef.current.forEach(({ peer }) => peer.replaceTrack(localVideoTrack, screenVideoTrack, stream));
      }
      if (myVideo.current) myVideo.current.srcObject = screenStream;
      setIsScreenSharing(true);
      screenVideoTrack.onended = stopScreenShare;
    } catch (error) {
      console.error("Screen share failed", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setRecordingError("Recording is not supported by this browser.");
      return;
    }
    if (!myVideo.current || !stream) {
      setRecordingError("Your local media is not ready to record yet.");
      return;
    }
    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) {
      setRecordingError("No supported recording format was found.");
      return;
    }

    const videos = [myVideo.current, ...remoteVideoRefs.current.values()];
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) {
      setRecordingError("The browser could not create a recording surface.");
      return;
    }
    const draw = () => {
      const columns = videos.length > 1 ? 2 : 1;
      const rows = Math.ceil(videos.length / columns);
      const tileWidth = canvas.width / columns;
      const tileHeight = canvas.height / rows;
      context.fillStyle = "#111827";
      context.fillRect(0, 0, canvas.width, canvas.height);
      videos.forEach((video, index) => {
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        const x = (index % columns) * tileWidth;
        const y = Math.floor(index / columns) * tileHeight;
        const sourceWidth = video.videoWidth || 16;
        const sourceHeight = video.videoHeight || 9;
        const scale = Math.max(tileWidth / sourceWidth, tileHeight / sourceHeight);
        const width = sourceWidth * scale;
        const height = sourceHeight * scale;
        context.drawImage(video, x + (tileWidth - width) / 2, y + (tileHeight - height) / 2, width, height);
      });
      recordingAnimationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    [stream, ...peersRef.current.flatMap(({ peer }) => peer.streams || [])].forEach((audioStream) => {
      if (audioStream.getAudioTracks().length > 0) audioContext.createMediaStreamSource(audioStream).connect(destination);
    });
    const recordingStream = new MediaStream([...canvasStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);

    const cleanup = () => {
      if (recordingAnimationFrameRef.current !== null) cancelAnimationFrame(recordingAnimationFrameRef.current);
      recordingAnimationFrameRef.current = null;
      recordingStream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    };

    try {
      recordedChunks.current = [];
      recordingMimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(recordingStream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };
      recorder.onerror = () => {
        cleanup();
        setRecordingError("Recording stopped because the browser reported an error.");
        const callback = afterRecordingStopRef.current;
        afterRecordingStopRef.current = null;
        callback?.();
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: recordingMimeTypeRef.current });
        cleanup();
        if (blob.size === 0) {
          setRecordingError("The recording was empty and could not be downloaded.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `local-call-recording-${new Date().toISOString()}.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        const callback = afterRecordingStopRef.current;
        afterRecordingStopRef.current = null;
        callback?.();
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setRecordingError(null);
      setIsRecording(true);
    } catch (error) {
      cleanup();
      console.error("Recording failed to start:", error);
      setRecordingError("Recording could not be started in this browser.");
    }
  };

  const leaveCall = () => {
    socketRef.current?.disconnect();
    const localStream = myVideo.current?.srcObject as MediaStream | null;
    localStream?.getTracks().forEach((track) => track.stop());
    window.location.href = "/";
  };

  const endCall = () => {
    if (isRecording) {
      afterRecordingStopRef.current = leaveCall;
      stopRecording();
      return;
    }
    leaveCall();
  };

  return {
    peers,
    stream,
    myVideo,
    remoteVideoRefs,
    isScreenSharing,
    isRecording,
    recordingError,
    isMobile,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    endCall,
  };
}
