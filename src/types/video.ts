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
  clips: VideoClip[];
  selectedClip: string | null;
  isProcessing: boolean;
  error: string | null;
}

export interface VideoEditorStore {
  video: VideoState;
  setVideoFile: (file: File) => Promise<void>;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addClip: (clip: Omit<VideoClip, 'id'>) => void;
  removeClip: (id: string) => void;
  selectClip: (id: string | null) => void;
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  exportClip: (id: string) => Promise<Blob | null>;
} 