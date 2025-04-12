import logo from '@/assets/film-reel.png';

export const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center">
          <img src={logo} alt="MP4 Clipper Logo" className="h-8 w-auto" />
          <h1 className="ml-3 text-xl font-semibold text-gray-900">Clip Editor</h1>
        </div>
      </div>
    </nav>
  );
}; 