import { useRef, useEffect, useState } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaSpinner, FaCut } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { VideoClip } from '@/types/video';

export const Timeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { video, setCurrentTime, setClipStart, setClipEnd, clipVideo, addToBatch } = useVideoStore();

  const startPos = (video.clipStart / video.duration) * 100;
  const endPos = (video.clipEnd / video.duration) * 100;
  const currentPos = (video.currentTime / video.duration) * 100;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const time = Math.max(0, Math.min(video.duration * pos, video.duration));

      if (isDragging === 'start') {
        setClipStart(Math.min(time, video.clipEnd - 1));
      } else {
        setClipEnd(Math.max(time, video.clipStart + 1));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, video.duration, video.clipStart, video.clipEnd, setClipStart, setClipEnd]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(video.duration * pos, video.duration));
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    <div className="space-y-6">
      <div className="relative h-12" ref={timelineRef} onClick={handleTimelineClick}>
        <div className="absolute inset-0 bg-gray-200 rounded-full" />
        <div
          className="absolute h-full bg-blue-200 rounded-full"
          style={{
            left: `${startPos}%`,
            width: `${endPos - startPos}%`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
          style={{ left: `${currentPos}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-pointer hover:scale-110 transition-transform"
          style={{ left: `${startPos}%` }}
          onMouseDown={() => setIsDragging('start')}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-pointer hover:scale-110 transition-transform"
          style={{ left: `${endPos}%` }}
          onMouseDown={() => setIsDragging('end')}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(video.currentTime)}</span>
        <span>{formatTime(video.clipEnd - video.clipStart)} selected</span>
        <span>{formatTime(video.duration)}</span>
      </div>

      <hr className="border-t border-gray-200" />
    </div>
  );
};