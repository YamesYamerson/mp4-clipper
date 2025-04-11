import { create } from 'zustand';
import { VideoEditorStore, VideoState } from '@/types/video';
import { VideoProcessor } from '../utils/VideoProcessor';

const initialState: VideoState = {
  file: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  clipStart: 0,
  clipEnd: 0,
  isProcessing: false,
  error: null,
};

export const useVideoStore = create<VideoEditorStore>((set, get) => ({
  video: initialState,
  
  setVideoFile: async (file) => {
    console.log('Setting video file:', file.name);
    set((state) => ({ video: { ...state.video, file, isProcessing: true } }));
    try {
      const processor = VideoProcessor.getInstance();
      await processor.init();
      const duration = await processor.getVideoDuration(file);
      console.log('Video duration:', duration);
      set((state) => ({
        video: { 
          ...state.video, 
          duration, 
          isProcessing: false,
          clipStart: 0,
          clipEnd: duration,
          error: null
        },
      }));
    } catch (error) {
      console.error('Error setting video file:', error);
      set((state) => ({
        video: {
          ...state.video,
          isProcessing: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        },
      }));
    }
  },

  setCurrentTime: (time) => {
    console.log('Setting current time:', time);
    set((state) => ({ 
      video: { ...state.video, currentTime: time } 
    }));
  },

  setIsPlaying: (isPlaying) => {
    console.log('Setting is playing:', isPlaying);
    set((state) => ({ 
      video: { ...state.video, isPlaying } 
    }));
  },

  setClipStart: (time) => {
    console.log('Setting clip start:', time);
    set((state) => ({ 
      video: { ...state.video, clipStart: time } 
    }));
  },

  setClipEnd: (time) => {
    console.log('Setting clip end:', time);
    set((state) => ({ 
      video: { ...state.video, clipEnd: time } 
    }));
  },

  clipVideo: async (start, end, onProgress) => {
    console.log('Starting video clip process:', { start, end });
    const state = get();
    if (!state.video.file) {
      console.error('No video file available for clipping');
      return null;
    }

    set((state) => ({ video: { ...state.video, isProcessing: true, error: null } }));
    try {
      const processor = VideoProcessor.getInstance();
      await processor.init();
      const blob = await processor.trimVideo(state.video.file, start, end, onProgress);
      console.log('Video clip process complete');
      set((state) => ({ video: { ...state.video, isProcessing: false } }));
      return blob;
    } catch (error) {
      console.error('Error during video clip process:', error);
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