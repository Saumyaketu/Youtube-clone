"use client";

import { LoaderCircle } from "lucide-react";
import PremiumModal from "./PremiumModal";
import VideoPlayerControls from "./video-player/VideoPlayerControls";
import { useVideoPlayer } from "./video-player/useVideoPlayer";
import type { VideoPlayerProps } from "./video-player/types";

const VideoPlayer = ({
  video,
  onNextVideo,
  onShowComments,
  roomId,
}: VideoPlayerProps) => {
  const {
    videoRef,
    activeSrc,
    isModalOpen,
    setIsModalOpen,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    quality,
    isChangingQuality,
    showSettings,
    setShowSettings,
    isFullscreen,
    qualityOptions,
    togglePlayback,
    handlePlay,
    handlePause,
    handleProgressChange,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleMediaVolumeChange,
    handleQualityChange,
    handleLoadedMetadata,
    handleCanPlay,
    handlePlaying,
    handleTimeUpdate,
    handleSeeked,
    handleDurationChange,
    handleError,
    toggleFullscreen,
    handleOverlayClick,
  } = useVideoPlayer({ video, onNextVideo, onShowComments, roomId });

  return (
    <>
      <div
        className="aspect-video bg-black rounded-lg overflow-hidden relative group"
        onDoubleClick={toggleFullscreen}
      >
        <video
          ref={videoRef}
          src={activeSrc}
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onSeeked={handleSeeked}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onDurationChange={handleDurationChange}
          onError={handleError}
          onPlay={handlePlay}
          onPlaying={handlePlaying}
          onPause={handlePause}
          onVolumeChange={handleMediaVolumeChange}
          playsInline
        >
          Your browser does not support the video tag.
        </video>
        <div
          className="absolute top-0 left-0 w-full h-[60%] md:h-[85%] z-10 cursor-pointer"
          onClick={handleOverlayClick}
        />
        {isChangingQuality && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70" aria-live="polite">
            <LoaderCircle className="animate-spin text-white" size={36} aria-label="Loading video quality" />
          </div>
        )}
        <VideoPlayerControls
          videoRef={videoRef}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playbackRate={playbackRate}
          quality={quality}
          isFullscreen={isFullscreen}
          showSettings={showSettings}
          qualityOptions={qualityOptions}
          onTogglePlayback={togglePlayback}
          onProgressChange={handleProgressChange}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onQualityChange={handleQualityChange}
          onToggleSettings={() => setShowSettings((open) => !open)}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default VideoPlayer;
