import { useRef, useEffect } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { video, setCurrentTime, setIsPlaying } = useVideoStore();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = video.currentTime;
      if (video.isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [video.currentTime, video.isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (video.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!video.isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={video.file ? URL.createObjectURL(video.file) : ''}
        className="w-full rounded-lg shadow-lg"
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleSeek(Math.max(0, video.currentTime - 5))}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaStepBackward className="w-6 h-6" />
        </button>
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          {video.isPlaying ? (
            <FaPause className="w-6 h-6" />
          ) : (
            <FaPlay className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={() => handleSeek(Math.min(video.duration, video.currentTime + 5))}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaStepForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 