# MP4 Clipper

A web-based video editing application that allows users to clip and download specific segments of MP4 videos. Built with React, TypeScript, and FFmpeg.

## Features

- Upload MP4 video files
- Preview video playback with custom controls
- Interactive timeline with dual sliders for selecting clip boundaries
- Real-time video processing with progress tracking
- Customizable output file names and formats
- Download processed video clips

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser with WebAssembly support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mp4-clipper.git
cd mp4-clipper
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
mp4-clipper/
├── src/
│   ├── components/
│   │   ├── Timeline.tsx      # Timeline component with clip selection
│   │   ├── VideoPlayer.tsx   # Video playback component
│   │   └── VideoUploader.tsx # File upload component
│   ├── lib/
│   │   └── store.ts          # Zustand store for state management
│   ├── types/
│   │   └── video.ts          # TypeScript type definitions
│   ├── utils/
│   │   └── VideoProcessor.ts # FFmpeg video processing utilities
│   └── App.tsx               # Main application component
├── public/
└── package.json
```

## Usage

### Uploading a Video

1. Click on the upload area or drag and drop an MP4 video file
2. The video will be loaded and displayed in the player

### Clipping a Video

1. Use the timeline sliders to select the start and end points of your clip
   - Drag the left handle to set the start time
   - Drag the right handle to set the end time
2. Click the "Prepare Clip" button to process the selected segment
3. Wait for the processing to complete (progress will be shown)
4. Enter a custom file name and select the output format
5. Click "Download" to save the clipped video

### Video Player Controls

- Play/Pause: Toggle video playback
- Timeline: Click anywhere on the timeline to seek to that position
- Current Time: Shows the current playback position
- Duration: Shows the total video duration

## Technical Details

### Video Processing

The application uses FFmpeg (via @ffmpeg/ffmpeg) for video processing. Key features:

- Video duration detection
- Frame-accurate clipping
- Progress tracking during processing
- Efficient memory management with cleanup routines

### State Management

The application uses Zustand for state management, tracking:
- Current video file
- Playback state
- Clip boundaries
- Processing status
- Error states

### Error Handling

The application includes comprehensive error handling for:
- File upload issues
- Video processing errors
- Playback problems
- Memory management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. Create new components in `src/components/`
2. Add necessary types to `src/types/`
3. Update the store in `src/lib/store.ts` if needed
4. Add utility functions to `src/utils/` if required

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FFmpeg for video processing capabilities
- React and TypeScript communities
- Tailwind CSS for styling
- Zustand for state management
