import { useCallback, useState } from 'react';
import { useVideoStore } from '@/lib/store';
import { FaDownload, FaTrash } from 'react-icons/fa';

export const Timeline = () => {
  const { video, addClip, selectClip, updateClip, removeClip, exportClip } = useVideoStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  const handleAddClip = useCallback(() => {
    if (video.duration > 0) {
      addClip({
        startTime: 0,
        endTime: video.duration,
        duration: video.duration,
      });
    }
  }, [video.duration, addClip]);

  const handleClipUpdate = useCallback(
    (id: string, startTime: number, endTime: number) => {
      updateClip(id, {
        startTime,
        endTime,
        duration: endTime - startTime,
      });
    },
    [updateClip]
  );

  const handleDragStart = useCallback((e: React.MouseEvent, clipId: string) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    selectClip(clipId);
  }, [selectClip]);

  const handleDrag = useCallback((e: React.MouseEvent, clipId: string) => {
    if (!isDragging || !video.selectedClip) return;

    const clip = video.clips.find(c => c.id === clipId);
    if (!clip) return;

    const deltaX = e.clientX - dragStart;
    const timelineWidth = e.currentTarget.parentElement?.clientWidth || 0;
    const timeDelta = (deltaX / timelineWidth) * video.duration;

    const newStartTime = Math.max(0, clip.startTime + timeDelta);
    const newEndTime = Math.min(video.duration, clip.endTime + timeDelta);

    if (newStartTime < newEndTime) {
      handleClipUpdate(clipId, newStartTime, newEndTime);
      setDragStart(e.clientX);
    }
  }, [isDragging, video.selectedClip, video.clips, video.duration, dragStart, handleClipUpdate]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleExport = useCallback(async (clipId: string) => {
    const blob = await exportClip(clipId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clip-${clipId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [exportClip]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <button
          onClick={handleAddClip}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Clip
        </button>
      </div>

      <div 
        className="relative h-32 bg-gray-200 rounded-lg overflow-hidden"
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {video.clips.map((clip) => (
          <div
            key={clip.id}
            className={`absolute h-full bg-blue-400 cursor-move group ${
              video.selectedClip === clip.id ? 'ring-2 ring-blue-600' : ''
            }`}
            style={{
              left: `${(clip.startTime / video.duration) * 100}%`,
              width: `${((clip.endTime - clip.startTime) / video.duration) * 100}%`,
            }}
            onMouseDown={(e) => handleDragStart(e, clip.id)}
            onMouseMove={(e) => handleDrag(e, clip.id)}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white">
              {clip.duration.toFixed(1)}s
            </div>
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleExport(clip.id)}
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="Export clip"
              >
                <FaDownload className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={() => removeClip(clip.id)}
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="Delete clip"
              >
                <FaTrash className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 