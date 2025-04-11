import { create } from 'zustand';
import { VideoEditorStore, VideoState } from '@/types/video';
import { VideoProcessor } from '../utils/videoProcessor';

const initialState: VideoState = {
  file: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  clips: [],
  selectedClip: null,
  isProcessing: false,
  error: null,
};

export const useVideoStore = create<VideoEditorStore>((set, get) => ({
  video: initialState,
  setVideoFile: async (file) => {
    set((state) => ({ video: { ...state.video, file, isProcessing: true } }));
    try {
      const processor = VideoProcessor.getInstance();
      await processor.init();
      const duration = await processor.getVideoDuration(file);
      set((state) => ({
        video: { ...state.video, duration, isProcessing: false },
      }));
    } catch (error) {
      set((state) => ({
        video: {
          ...state.video,
          isProcessing: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
    }
  },
  setCurrentTime: (time) => set((state) => ({ video: { ...state.video, currentTime: time } })),
  setIsPlaying: (isPlaying) => set((state) => ({ video: { ...state.video, isPlaying } })),
  addClip: (clip) =>
    set((state) => ({
      video: {
        ...state.video,
        clips: [...state.video.clips, { ...clip, id: crypto.randomUUID() }],
      },
    })),
  removeClip: (id) =>
    set((state) => ({
      video: {
        ...state.video,
        clips: state.video.clips.filter((clip) => clip.id !== id),
        selectedClip: state.video.selectedClip === id ? null : state.video.selectedClip,
      },
    })),
  selectClip: (id) => set((state) => ({ video: { ...state.video, selectedClip: id } })),
  updateClip: (id, updates) =>
    set((state) => ({
      video: {
        ...state.video,
        clips: state.video.clips.map((clip) =>
          clip.id === id ? { ...clip, ...updates } : clip
        ),
      },
    })),
  exportClip: async (id) => {
    const state = get();
    const clip = state.video.clips.find((c) => c.id === id);
    if (!clip || !state.video.file) return null;

    set((state) => ({ video: { ...state.video, isProcessing: true } }));
    try {
      const processor = VideoProcessor.getInstance();
      await processor.init();
      const blob = await processor.trimVideo(
        state.video.file,
        clip.startTime,
        clip.endTime
      );
      set((state) => ({ video: { ...state.video, isProcessing: false } }));
      return blob;
    } catch (error) {
      set((state) => ({
        video: {
          ...state.video,
          isProcessing: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
      return null;
    }
  },
})); 