import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useVideoStore } from '@/lib/store';

export const VideoUploader = () => {
  const { setVideoFile } = useVideoStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && (file.type === 'video/mp4' || file.type === 'video/quicktime')) {
        setVideoFile(file);
      }
    },
    [setVideoFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          />
        </svg>
        <div className="text-gray-600">
          {isDragActive ? (
            <p>Drop the video file here ...</p>
          ) : (
            <p>Drag and drop a video file here, or click to select a file</p>
          )}
        </div>
        <p className="text-sm text-gray-500">Supports MP4 and MOV files</p>
      </div>
    </div>
  );
}; 