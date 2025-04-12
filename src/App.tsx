import { useVideoStore } from '@/lib/store'
import { VideoUploader } from '@/components/VideoUploader'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Timeline } from '@/components/Timeline'
import { BatchDisplay } from '@/components/BatchDisplay'
import { Navbar } from '@/components/Navbar'
import { FaSpinner } from 'react-icons/fa'
import './App.css'

function App() {
  const { video } = useVideoStore()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto px-6 py-6">
        <div className="video-editor">
          {video.isProcessing && (
            <div className="processing-overlay">
              <div className="flex flex-col items-center gap-4">
                <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-gray-600">Processing video...</span>
              </div>
            </div>
          )}

          {video.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{video.error}</p>
            </div>
          ) : !video.file ? (
            <VideoUploader />
          ) : (
            <div className="space-y-6">
              <div className="video-controls">
                <VideoPlayer />
              </div>
              <div className="timeline-container">
                <Timeline />
              </div>
              <BatchDisplay />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
