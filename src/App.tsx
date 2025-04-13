import { useVideoStore } from '@/lib/store'
import { VideoUploader } from '@/components/VideoUploader'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Timeline } from '@/components/Timeline'
import { BatchDisplay } from '@/components/BatchDisplay'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { FaSpinner, FaUpload, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useState } from 'react'
import './App.css'

function App() {
  const { video, setVideoFile } = useVideoStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleNewUpload = () => {
    setVideoFile(null)
  }

  return (
    <div className="min-h-screen bg-[#1e2028] flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-300 flex ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <Sidebar />
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-20 bg-[#2a2d37] text-gray-400 hover:text-gray-100 p-1.5 rounded-r border border-[#3a3d47] border-l-0 transition-all duration-300"
          style={{
            transform: `translateX(${isSidebarOpen ? '256px' : '0px'})`
          }}
        >
          {isSidebarOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
        </button>
        
        <main className="flex-1 overflow-y-auto bg-[#1e2028]">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="video-editor bg-white rounded-lg shadow-lg">
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
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">
                      {video.file.name}
                    </h1>
                    <button
                      onClick={handleNewUpload}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <FaUpload className="mr-2 -ml-1 h-4 w-4" />
                      Upload New Video
                    </button>
                  </div>
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
