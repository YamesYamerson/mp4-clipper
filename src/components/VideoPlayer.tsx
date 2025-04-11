import { useRef, useEffect } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const { video, setCurrentTime, setIsPlaying } = useVideoStore();

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

  // Handle current time updates
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || videoElement.currentTime === video.currentTime) return;
    
    videoElement.currentTime = video.currentTime;
  }, [video.currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current || !video.file) return;
    
    try {
      if (video.isPlaying) {
        videoRef.current.pause();
      } else {
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
    
    const newTime = Math.max(0, Math.min(time, video.duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.target as HTMLVideoElement;
    console.error('Video error:', videoElement.error);
    setIsPlaying(false);
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
          onClick={() => handleSeek(Math.max(0, video.currentTime - 5))}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
        >
          <FaStepBackward className="w-6 h-6" />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
        >
          {video.isPlaying ? (
            <FaPause className="w-6 h-6" />
          ) : (
            <FaPlay className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={() => handleSeek(Math.min(video.duration, video.currentTime + 5))}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          disabled={!video.file}
        >
          <FaStepForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 