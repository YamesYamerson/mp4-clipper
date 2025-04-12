import { useVideoStore } from '@/lib/store';
import { FaTrash, FaDownload } from 'react-icons/fa';

export const BatchDisplay = () => {
  const { video, removeFromBatch } = useVideoStore();

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
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Batch ({video.batch.length})</h2>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <FaDownload />
          Download All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {video.batch.map((clip) => (
          <div
            key={clip.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col"
          >
            <div className="flex-1">
              {clip.thumbnail ? (
                <img
                  src={URL.createObjectURL(clip.thumbnail)}
                  alt={`Thumbnail for ${clip.name}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-gray-500">No thumbnail</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{clip.name}</h3>
                  <p className="text-sm text-gray-500">
                    {clip.extension} • {formatDuration(clip.duration)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(clip.id)}
                  className="p-2 text-red-500 hover:text-red-600"
                  title="Remove from batch"
                >
                  <FaTrash />
                </button>
              </div>
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