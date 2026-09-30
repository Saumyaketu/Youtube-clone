export type VideoSource = {
  label?: string;
  quality?: string;
  src?: string;
  url?: string;
  filepath?: string;
};

export type VideoData = {
  filepath?: string;
  duration?: number;
  sources?: VideoSource[];
};

export type VideoPlayerProps = {
  video: VideoData;
  onNextVideo?: () => void;
  onShowComments?: () => void;
  roomId?: string | null;
};

export type QualityOption = {
  label: string;
  value: string;
  src: string;
};
