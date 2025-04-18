import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';
import { ProgressCallback } from '@/types/video';

interface FFmpegLogEvent {
  message: string;
}

interface FFmpegProgressEvent {
  progress: number;
  time: number;
}

export class VideoProcessor {
  private static instance: VideoProcessor;
  private ffmpeg: FFmpeg;
  private isInitialized: boolean = false;
  private progressCallback: ProgressCallback | null = null;
  private isProcessingComplete: boolean = false;

  private constructor() {
    this.ffmpeg = new FFmpeg();
    
    // Set up logging and progress handlers
    this.ffmpeg.on('log', ({ message }: FFmpegLogEvent) => {
      // Ignore abort message during cleanup if processing was successful
      if (message === 'Aborted()' && this.isProcessingComplete) {
        return;
      }
      console.log('FFmpeg Log:', message);
    });

    this.ffmpeg.on('progress', ({ progress }: FFmpegProgressEvent) => {
      console.log(`FFmpeg Progress: ${progress}% at ${Date.now()}ms`);
      if (this.progressCallback) {
        this.progressCallback(progress / 100);
      }
    });
  }

  public static getInstance(): VideoProcessor {
    if (!VideoProcessor.instance) {
      VideoProcessor.instance = new VideoProcessor();
    }
    return VideoProcessor.instance;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      await this.ffmpeg.load({
        coreURL,
        wasmURL,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      throw error;
    }
  }

  async trimVideo(inputFile: File, startTime: number, endTime: number, onProgress?: ProgressCallback): Promise<Blob> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      this.progressCallback = onProgress || null;
      this.isProcessingComplete = false;

      // Write the input file to FFmpeg's virtual filesystem
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(inputFile));

      // Calculate duration from start and end time
      const duration = endTime - startTime;

      // Execute FFmpeg command to clip the video
      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c:v', 'copy',
        '-c:a', 'copy',
        'output.mp4'
      ]);

      // Read the output file from FFmpeg's virtual filesystem
      const data = await this.ffmpeg.readFile('output.mp4');
      
      // Create blob from the data
      const blob = new Blob([data], { type: 'video/mp4' });
      
      // Mark processing as complete before cleanup
      this.isProcessingComplete = true;
      
      // Clean up FFmpeg instance
      await this.cleanup();
      
      return blob;
    } catch (error) {
      console.error('Error processing video:', error);
      await this.cleanup();
      throw error;
    } finally {
      this.progressCallback = null;
      this.isProcessingComplete = false;
    }
  }

  async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  async getVideoThumbnail(file: File, time: number): Promise<Blob> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      // Write the input file to FFmpeg's virtual filesystem
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(file));

      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', time.toString(),
        '-vframes', '1',
        '-f', 'image2',
        'thumbnail.jpg'
      ]);

      const data = await this.ffmpeg.readFile('thumbnail.jpg');
      
      // Create blob from the data
      const blob = new Blob([data], { type: 'image/jpeg' });
      
      // Clean up FFmpeg instance
      await this.cleanup();
      
      return blob;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async cleanup() {
    try {
      await this.ffmpeg.terminate();
      this.isInitialized = false;
      this.ffmpeg = new FFmpeg();
      
      // Re-setup logging and progress handlers
      this.ffmpeg.on('log', ({ message }: FFmpegLogEvent) => {
        // Ignore abort message during cleanup if processing was successful
        if (message === 'Aborted()' && this.isProcessingComplete) {
          return;
        }
        console.log('FFmpeg Log:', message);
      });

      this.ffmpeg.on('progress', ({ progress }: FFmpegProgressEvent) => {
        console.log(`FFmpeg Progress: ${progress}% at ${Date.now()}ms`);
        if (this.progressCallback) {
          this.progressCallback(progress / 100);
        }
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
} 