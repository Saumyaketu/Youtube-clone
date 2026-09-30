import { QualityOption, VideoData } from "./types";

export const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const getOriginalVideoUrl = (video: VideoData) =>
  video.filepath?.startsWith("http")
    ? video.filepath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`;

export const getQualityOptions = (
  video: VideoData,
  playableSrc?: string,
): QualityOption[] => {
  const originalVideoUrl = getOriginalVideoUrl(video);
  const originalSource = playableSrc || originalVideoUrl;
  const qualitySources = Array.isArray(video.sources)
    ? video.sources
        .map((source) => ({
          label: source.label || source.quality,
          src: source.src || source.url || source.filepath,
        }))
        .filter(
          (source): source is { label: string; src: string } =>
            Boolean(source.label && source.src),
        )
    : [];

  return [
    { label: "Auto", value: "auto", src: originalSource },
    { label: "Original", value: "original", src: originalSource },
    ...qualitySources.map((source) => ({
      label: source.label,
      value: source.label,
      src: source.src,
    })),
  ];
};
