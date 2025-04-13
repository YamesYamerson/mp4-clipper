import { useVideoStore } from '@/lib/store';
import { FaTrash, FaDownload } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export const BatchDisplay = () => {
  const { video, removeFromBatch } = useVideoStore();
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Create object URLs for thumbnails
    const urls: { [key: string]: string } = {};
    video.batch.forEach((clip) => {
      if (clip.thumbnail && !thumbnailUrls[clip.id]) {
        urls[clip.id] = URL.createObjectURL(clip.thumbnail);
      }
    });

    setThumbnailUrls(prev => ({ ...prev, ...urls }));

    // Cleanup
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [video.batch]);

  const handleDownloadAll = () => {
    video.batch.forEach((clip) => {
      const url = URL.createObjectURL(clip.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clip.name}${clip.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleRemove = (id: string) => {
    removeFromBatch(id);
  };

  if (video.batch.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Batch ({video.batch.length})
        </h2>
        <button
          onClick={() => {
            video.batch.forEach((clip) => {
              const url = URL.createObjectURL(clip.blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = clip.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            });
          }}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaDownload className="-ml-1 mr-2 h-4 w-4" />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {video.batch.map((clip) => (
          <div
            key={clip.id}
            className="bg-gray-50 rounded-lg overflow-hidden shadow group"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {thumbnailUrls[clip.id] ? (
                <img
                  src={thumbnailUrls[clip.id]}
                  alt={clip.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  No thumbnail
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 truncate">
                {clip.name}
              </div>
              <div className="text-xs text-gray-500">
                Duration: {formatDuration(clip.duration)}
              </div>
              <button
                onClick={() => handleRemove(clip.id)}
                className="mt-2 w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaTrash className="-ml-1 mr-2 h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 