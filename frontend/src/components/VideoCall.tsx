"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import CallControls from "./video-call/CallControls";
import RemoteVideo from "./video-call/RemoteVideo";
import { useVideoCall } from "./video-call/useVideoCall";

interface VideoCallProps {
  roomId: string;
}

export default function VideoCall({ roomId }: VideoCallProps) {
  const [pinnedUser, setPinnedUser] = useState<string | null>(null);
  const {
    peers,
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
  } = useVideoCall(roomId);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={`grid gap-3 w-full place-content-center mx-auto max-w-7xl transition-all duration-300 ${pinnedUser ? "grid-cols-[repeat(auto-fit,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]" : "grid-cols-[repeat(auto-fit,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]"}`}>
        <ParticipantTile
          id="local"
          label={`You ${isScreenSharing ? "(Sharing Screen)" : ""} ${isMuted ? "(Muted)" : ""}`}
          pinnedUser={pinnedUser}
          onPin={() => setPinnedUser(pinnedUser === "local" ? null : "local")}
          video={
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className={`w-full bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video object-cover shadow-lg border border-gray-300 dark:border-gray-700 transition-colors ${!isScreenSharing && !isVideoOff ? "-scale-x-100" : ""}`}
            />
          }
        >
          {isVideoOff && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg pointer-events-none"><p className="text-white font-bold text-lg">Camera Off</p></div>}
        </ParticipantTile>

        {peers.map((peerObj) => (
          <ParticipantTile
            key={peerObj.peerID}
            id={peerObj.peerID}
            label="Participant"
            pinnedUser={pinnedUser}
            onPin={() => setPinnedUser(pinnedUser === peerObj.peerID ? null : peerObj.peerID)}
            video={<RemoteVideo peer={peerObj.peer} onVideoElement={(element) => element ? remoteVideoRefs.current.set(peerObj.peerID, element) : remoteVideoRefs.current.delete(peerObj.peerID)} />}
          />
        ))}
      </div>

      <CallControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        isMobile={isMobile}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onEndCall={endCall}
      />
      {recordingError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{recordingError}</p>}
    </div>
  );
}

interface ParticipantTileProps {
  id: string;
  label: string;
  pinnedUser: string | null;
  onPin: () => void;
  video: React.ReactNode;
  children?: React.ReactNode;
}

function ParticipantTile({ id, label, pinnedUser, onPin, video, children }: ParticipantTileProps) {
  const isPinned = pinnedUser === id;
  return (
    <div className={`relative group overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${isPinned ? "col-span-full order-first w-full md:w-[85%] mx-auto" : "order-0"}`}>
      <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-gray-900 bg-white/80 dark:text-white dark:bg-black/60 absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs shadow-md backdrop-blur-sm">{label}</span>
      <button onClick={onPin} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md backdrop-blur-md shadow-lg border border-white/10" title={isPinned ? "Shrink video" : "Expand video"}>
        {isPinned ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      {video}
      {children}
    </div>
  );
}
