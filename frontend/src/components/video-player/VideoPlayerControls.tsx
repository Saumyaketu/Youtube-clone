import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import { formatTime } from "./utils";
import type { QualityOption } from "./types";

type VideoPlayerControlsProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
  showSettings: boolean;
  qualityOptions: QualityOption[];
  onTogglePlayback: () => void;
  onProgressChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPlaybackRateChange: (rate: number) => void;
  onQualityChange: (quality: string) => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
};

export default function VideoPlayerControls({
  videoRef,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  quality,
  isFullscreen,
  showSettings,
  qualityOptions,
  onTogglePlayback,
  onProgressChange,
  onVolumeChange,
  onPlaybackRateChange,
  onQualityChange,
  onToggleSettings,
  onToggleFullscreen,
}: VideoPlayerControlsProps) {
  const toggleMute = () => {
    if (videoRef.current) videoRef.current.volume = volume ? 0 : 1;
    onVolumeChange({
      target: { value: volume ? "0" : "1" },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/90 to-transparent px-3 pb-3 pt-10 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
      <input
        aria-label="Video progress"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={onProgressChange}
        className="mb-2 h-1 w-full cursor-pointer accent-red-600"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={onTogglePlayback} aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={volume ? "Mute" : "Unmute"} title={volume ? "Mute" : "Unmute"}>
          {volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <input
          aria-label="Volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={onVolumeChange}
          className="hidden w-20 cursor-pointer accent-white sm:block"
        />
        <span className="text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <button type="button" onClick={onToggleSettings} aria-label="Playback settings" title="Playback settings">
              <Settings size={18} />
            </button>
            {showSettings && (
              <div className="absolute bottom-8 right-0 w-48 rounded-md bg-black/95 p-2 text-sm shadow-xl">
                <label className="mb-2 block text-xs text-white/60" htmlFor="playback-rate">Playback speed</label>
                <select
                  id="playback-rate"
                  value={playbackRate}
                  onChange={(event) => onPlaybackRateChange(Number(event.target.value))}
                  className="mb-3 w-full rounded bg-white/10 px-2 py-1 text-white"
                >
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <option key={rate} value={rate} className="bg-black">{rate}x</option>
                  ))}
                </select>
                <label className="mb-2 block text-xs text-white/60" htmlFor="video-quality">Quality</label>
                <select
                  id="video-quality"
                  value={quality}
                  onChange={(event) => onQualityChange(event.target.value)}
                  className="w-full rounded bg-white/10 px-2 py-1 text-white"
                >
                  {qualityOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">{option.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button type="button" onClick={onToggleFullscreen} aria-label="Toggle fullscreen" title="Toggle fullscreen">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
