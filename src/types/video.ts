export interface VideoClip {
  id: string;
  name: string;
  blob: Blob;
  thumbnail?: Blob;
  start: number;
  end: number;
  duration: number;
  extension: string;
  createdAt: Date;
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
  batch: VideoClip[];
  uploadedVideos: File[];
}

export type ProgressCallback = (progress: number) => void;

export interface VideoEditorStore {
  video: VideoState;
  setVideoFile: (file: File | null) => Promise<void>;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setClipStart: (time: number) => void;
  setClipEnd: (time: number) => void;
  clipVideo: (start: number, end: number, onProgress?: (progress: number) => void) => Promise<Blob | null>;
  addToBatch: (clip: VideoClip) => void;
  removeFromBatch: (id: string) => void;
  clearBatch: () => void;
  removeUploadedVideo: (fileName: string) => void;
  renameClip: (id: string, newName: string) => void;
  renameUploadedVideo: (oldName: string, newName: string) => void;
} 