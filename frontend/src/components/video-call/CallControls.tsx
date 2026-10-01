"use client";

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isMobile: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
}

export default function CallControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  isMobile,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
      <button onClick={onToggleMute} className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}`}>
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <button onClick={onToggleVideo} className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}`}>
        {isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
      </button>
      {!isMobile && (
        <button onClick={onToggleScreenShare} className="w-full py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        </button>
      )}
      <button onClick={onToggleRecording} className={`w-full py-2 text-sm font-semibold text-white rounded-md transition ${isRecording ? "bg-red-600 animate-pulse" : "bg-green-600 hover:bg-green-700"}`}>
        {isRecording ? "Stop Recording" : "Record Local"}
      </button>
      <button onClick={onEndCall} className="w-full py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition md:col-span-1 col-span-2">
        End Call
      </button>
    </div>
  );
}
