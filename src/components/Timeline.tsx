import { useRef, useEffect, useState } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { VideoClip } from '@/types/video';

interface ProcessedVideo {
  blob: Blob;
  size: string;
  type: string;
  thumbnail: Blob;
}

export const Timeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [fileExtension, setFileExtension] = useState('.mp4');
  const { video, setCurrentTime, setClipStart, setClipEnd, clipVideo, addToBatch } = useVideoStore();

  const startPos = (video.clipStart / video.duration) * 100;
  const endPos = (video.clipEnd / video.duration) * 100;
  const currentPos = (video.currentTime / video.duration) * 100;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClipVideo = async () => {
    if (!video.file) {
      console.log('No video file available');
      return;
    }
    
    console.log('Starting clip process');
    setIsProcessing(true);
    setProgress(0);
    setProcessedVideo(null);
    setDownloadName('');
    
    try {
      const blob = await clipVideo(video.clipStart, video.clipEnd, (progress) => {
        console.log('Progress update:', progress);
        setProgress(progress);
      });
      
      console.log('Clip process complete, blob received:', !!blob);
      if (blob) {
        const baseFileName = video.file.name.replace(/\.[^/.]+$/, '');
        const newName = `${baseFileName}_clip`;
        const newExtension = `.${blob.type.split('/')[1]}`;
        
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
        
        console.log('Creating processed video object:', {
          size: formatFileSize(blob.size),
          type: blob.type,
          name: newName,
          extension: newExtension
        });

        const processedVideoObj = {
          blob,
          size: formatFileSize(blob.size),
          type: blob.type,
          thumbnail: thumbnailBlob
        };

        setTimeout(() => {
          setProcessedVideo(processedVideoObj);
          setDownloadName(newName);
          setFileExtension(newExtension);
          setIsProcessing(false);
          setProgress(0);
        }, 0);
      }
    } catch (error) {
      console.error('Error during clip process:', error);
      setProcessedVideo(null);
      setDownloadName('');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleAddToBatch = () => {
    if (!processedVideo || !downloadName) {
      console.log('Cannot add to batch: missing data', {
        hasProcessedVideo: !!processedVideo,
        hasDownloadName: !!downloadName
      });
      return;
    }

    const clip: VideoClip = {
      id: uuidv4(),
      startTime: video.clipStart,
      endTime: video.clipEnd,
      duration: video.clipEnd - video.clipStart,
      name: downloadName,
      extension: fileExtension,
      blob: processedVideo.blob,
      thumbnail: processedVideo.thumbnail
    };

    addToBatch(clip);
    setProcessedVideo(null);
    setDownloadName('');
    setFileExtension('.mp4');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
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

      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatTime(video.clipStart)}</span>
        <span>{formatTime(video.clipEnd - video.clipStart)} selected</span>
        <span>{formatTime(video.clipEnd)}</span>
      </div>

      {video.clipEnd > video.clipStart && (
        <div className="flex flex-col items-center gap-4">
          {!processedVideo ? (
            <button
              onClick={handleClipVideo}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing... {Math.round(progress * 100)}%
                </>
              ) : (
                'Prepare Clip'
              )}
            </button>
          ) : (
            <div className="timeline-download-panel p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Size: {processedVideo.size}</span>
                <span>Type: {processedVideo.type}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="filename" className="text-sm font-medium text-gray-700">
                  File name
                </label>
                <div className="filename-input-group">
                  <input
                    id="filename"
                    type="text"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    className="filename-input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                    placeholder="Enter file name"
                  />
                  <select
                    value={fileExtension}
                    onChange={(e) => setFileExtension(e.target.value)}
                    className="extension-select px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  >
                    <option value=".mp4">.mp4</option>
                    <option value=".mov">.mov</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setProcessedVideo(null);
                    setDownloadName('');
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  onClick={handleAddToBatch}
                  disabled={!downloadName}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Batch
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};