export interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface VideoState {
  file: File | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  clipStart: number;
  clipEnd: number;
  isProcessing: boolean;
  error: string | null;
}

export type ProgressCallback = (progress: number) => void;

export interface VideoEditorStore {
  video: VideoState;
  setVideoFile: (file: File) => Promise<void>;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setClipStart: (time: number) => void;
  setClipEnd: (time: number) => void;
  clipVideo: (start: number, end: number, onProgress: ProgressCallback) => Promise<Blob | null>;
} 