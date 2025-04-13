import { FaVideo } from 'react-icons/fa'

export const Navbar = () => {
  return (
    <nav className="bg-[#1e2028] border-b border-[#2a2d37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaVideo className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <span className="text-lg font-semibold text-gray-100">Clip Editor</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 