import { useRef, useEffect, useState } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaPlay, FaPause, FaForward, FaBackward, FaStepForward, FaStepBackward, FaFastForward, FaFastBackward, FaCut, FaSpinner } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { VideoClip } from '@/types/video';

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const { video, setCurrentTime, setIsPlaying, clipVideo, addToBatch } = useVideoStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle video source changes
  useEffect(() => {
    if (video.file && videoRef.current) {
      // Clean up previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      // Create new object URL
      objectUrlRef.current = URL.createObjectURL(video.file);
      videoRef.current.src = objectUrlRef.current;
      
      // Load the video
      videoRef.current.load();
    }

    // Cleanup on unmount or when video changes
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [video.file]);

  // Handle video playback state
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = async () => {
      try {
        if (video.isPlaying) {
          await videoElement.play();
        } else {
          videoElement.pause();
        }
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    };

    handlePlay();
  }, [video.isPlaying, setIsPlaying]);

  // Handle current time updates and clip boundaries
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Ensure current time stays within clip boundaries
    if (videoElement.currentTime < video.clipStart) {
      videoElement.currentTime = video.clipStart;
    } else if (videoElement.currentTime > video.clipEnd) {
      videoElement.currentTime = video.clipEnd;
      setIsPlaying(false);
    }
    
    setCurrentTime(videoElement.currentTime);
  }, [video.currentTime, video.clipStart, video.clipEnd, setCurrentTime, setIsPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      // Ensure time stays within clip boundaries
      if (currentTime < video.clipStart) {
        videoRef.current.currentTime = video.clipStart;
      } else if (currentTime > video.clipEnd) {
        videoRef.current.currentTime = video.clipEnd;
        setIsPlaying(false);
      }
      setCurrentTime(currentTime);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current || !video.file) return;
    
    try {
      if (video.isPlaying) {
        videoRef.current.pause();
      } else {
        // If we're at the end, restart from the beginning of the clip
        if (videoRef.current.currentTime >= video.clipEnd) {
          videoRef.current.currentTime = video.clipStart;
        }
        await videoRef.current.play();
      }
      setIsPlaying(!video.isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current || !video.file) return;
    
    // Ensure time stays within clip boundaries
    const newTime = Math.max(video.clipStart, Math.min(time, video.clipEnd));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error('Video error:', videoElement.error);
    setIsPlaying(false);
  };

  const handlePrepareClip = async () => {
    if (!video.file) return;
    
    setIsProcessing(true);
    try {
      const blob = await clipVideo(video.clipStart, video.clipEnd);
      if (blob) {
        // Create a video element to extract the first frame
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(blob);
        
        // Wait for the video to be loaded
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = resolve;
        });
        
        // Seek to the first frame
        videoElement.currentTime = 0;
        
        // Create a canvas to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Wait for the frame to be ready
        await new Promise((resolve) => {
          videoElement.onseeked = () => {
            ctx?.drawImage(videoElement, 0, 0);
            resolve(null);
          };
        });
        
        // Convert canvas to blob
        const thumbnailBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.8);
        });

        const clip: VideoClip = {
          id: uuidv4(),
          name: `Clip ${video.batch.length + 1} - ${video.file.name}`,
          blob,
          thumbnail: thumbnailBlob,
          start: video.clipStart,
          end: video.clipEnd,
          duration: video.clipEnd - video.clipStart,
          createdAt: new Date(),
          extension: 'mp4'
        };
        addToBatch(clip);
      }
    } catch (error) {
      console.error('Error preparing clip:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onEnded={() => setIsPlaying(false)}
          playsInline
          preload="metadata"
          controls={false}
        />
      </div>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleSeek(video.clipStart)}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
          title="Go to start of clip"
        >
          <FaStepBackward className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSeek(Math.max(video.clipStart, video.currentTime - 5))}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
          title="Step backward 5 seconds"
        >
          <FaBackward className="w-5 h-5" />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
          title={video.isPlaying ? "Pause" : "Play"}
        >
          {video.isPlaying ? (
            <FaPause className="w-5 h-5" />
          ) : (
            <FaPlay className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => handleSeek(Math.min(video.clipEnd, video.currentTime + 5))}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
          title="Step forward 5 seconds"
        >
          <FaForward className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleSeek(video.clipEnd)}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
          title="Go to end of clip"
        >
          <FaStepForward className="w-5 h-5" />
        </button>
        <button
          onClick={handlePrepareClip}
          disabled={isProcessing}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            <>
              <FaCut className="-ml-1 mr-2 h-4 w-4" />
              Prepare Clip
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 