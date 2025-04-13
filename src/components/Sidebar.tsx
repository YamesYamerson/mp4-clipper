import { useVideoStore } from '@/lib/store'
import { VideoClip } from '@/types/video'
import { FaVideo, FaTrash, FaPen, FaChevronDown, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { useState } from 'react'

export const Sidebar = () => {
  const { video, setVideoFile, removeFromBatch, removeUploadedVideo, renameClip, renameUploadedVideo } = useVideoStore()
  const [showUploads, setShowUploads] = useState(true)
  const [showClips, setShowClips] = useState(true)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleVideoSelect = async (file: File) => {
    await setVideoFile(file)
  }

  const handleRemoveFromBatch = (id: string) => {
    removeFromBatch(id)
  }

  const handleRemoveUpload = (fileName: string) => {
    if (video.file?.name === fileName) {
      setVideoFile(null)
    }
    removeUploadedVideo(fileName)
  }

  const formatDuration = (duration: number) => {
    if (!duration || isNaN(duration)) return '0:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const startRename = (name: string) => {
    setEditingName(name)
    setNewName(name)
  }

  const handleRename = (oldName: string, isClip = false) => {
    if (!newName || newName === oldName) {
      setEditingName(null)
      return
    }

    const newNameWithExt = isClip ? newName : (() => {
      const extension = oldName.split('.').pop()
      return newName.includes('.') ? newName : `${newName}.${extension}`
    })()

    if (isClip) {
      renameClip(oldName, newNameWithExt)
    } else {
      renameUploadedVideo(oldName, newNameWithExt)
    }
    
    setEditingName(null)
  }

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="w-64 bg-[#1e2028] border-r border-[#2a2d37] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[#2a2d37] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">File Manager</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-400 hover:text-gray-100 p-1 rounded transition-colors"
        >
          <FaChevronLeft size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-[#2a2d37]">
          <button
            onClick={() => setShowUploads(!showUploads)}
            className="w-full p-4 flex items-center justify-between hover:bg-[#2a2d37] transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-100">Uploaded Videos</h2>
            {showUploads ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
          </button>
          
          {showUploads && (
            <div className="px-4 pb-4 space-y-2">
              {video.uploadedVideos?.map((file) => (
                <div
                  key={file.name}
                  className={`group relative flex items-center p-2 rounded cursor-pointer transition-colors ${
                    video.file?.name === file.name ? 'bg-blue-500/10' : 'hover:bg-[#2a2d37]'
                  }`}
                  onClick={() => handleVideoSelect(file)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaVideo className={`${video.file?.name === file.name ? 'text-blue-400' : 'text-gray-400'}`} />
                    <div className="flex flex-col flex-1 min-w-0">
                      {editingName === file.name ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => handleRename(file.name)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(file.name)}
                          className="text-sm bg-[#2a2d37] border border-[#3a3d47] rounded px-1 py-0.5 text-gray-100 focus:outline-none focus:border-blue-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-100 truncate">
                          {file.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1e2028]/80 px-2 py-1 rounded">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(file.name); }}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveUpload(file.name); }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-4 border-[#2a2d37]">
          <button
            onClick={() => setShowClips(!showClips)}
            className="w-full p-4 flex items-center justify-between hover:bg-[#2a2d37] transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-100">Batch Clips</h2>
            {showClips ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
          </button>
          
          {showClips && (
            <div className="px-4 pb-4 space-y-2">
              {video.batch.map((clip: VideoClip) => (
                <div
                  key={clip.id}
                  className="group relative flex items-center p-2 rounded hover:bg-[#2a2d37] transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaVideo className="text-gray-400" />
                    <div className="flex flex-col flex-1 min-w-0">
                      {editingName === clip.id ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => handleRename(clip.id, true)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(clip.id, true)}
                          className="text-sm bg-[#2a2d37] border border-[#3a3d47] rounded px-1 py-0.5 text-gray-100 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-100 truncate">
                          {clip.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDuration(clip.end - clip.start)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1e2028]/80 px-2 py-1 rounded">
                    <button
                      onClick={() => startRename(clip.id)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveFromBatch(clip.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 