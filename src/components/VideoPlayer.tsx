import { useRef, useEffect } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaPlay, FaPause, FaForward, FaBackward, FaStepForward, FaStepBackward } from 'react-icons/fa';

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
      </div>
    </div>
  );
}; 