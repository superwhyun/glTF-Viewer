# GLTF Viewer

A modern, interactive 3D model viewer for GLTF, GLB, VRM, and VRMA files built with Next.js and Three.js.

![GLTF Viewer Screenshot](https://via.placeholder.com/800x400/f5f5f5/333333?text=GLTF+Viewer)

## ✨ Features

### 🎯 Core Features
- **Multi-format Support**: GLTF, GLB, VRM, and VRMA files
- **Interactive 3D Viewer**: Mouse controls for rotation, zoom, and panning
- **Real-time Animation**: Play, pause, and control animations with speed adjustment
- **External Animation Loading**: Drop VRMA files to apply animations to existing models
- **Dark/Light Theme**: Toggle between dark and light themes

### 📊 Information Display
- **Model Metadata**: File information, structure details, and performance stats
- **Scene Graph Explorer**: Hierarchical tree view of 3D scene structure
- **Material Inspector**: PBR material properties and texture gallery
- **Extension Support**: Display used glTF extensions with categorization
- **Animation Controls**: Timeline, speed controls, and animation selection

### 🎨 Rendering Options
- **Wireframe Mode**: Toggle wireframe rendering
- **Advanced Lighting**: Environment lighting, ambient light, and directional light controls
- **Grid Display**: Optional ground grid for spatial reference
- **Auto Model Alignment**: Automatic centering and scaling for optimal viewing

### 🔧 Technical Features
- **Performance Optimized**: WebGL optimizations, texture compression, frustum culling
- **Memory Efficient**: Automatic cleanup and resource management
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd glTFViewer
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
glTFViewer/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── animation/         # Animation controls
│   ├── file-drop/         # File upload components
│   ├── info/              # Information panels
│   ├── layout/            # Layout components
│   ├── materials/         # Material inspector
│   ├── model/             # 3D model components
│   ├── performance/       # Performance monitoring
│   ├── rendering/         # Rendering controls
│   ├── scene/             # Scene graph components
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Style files
└── vibe-spec/             # Project specifications
```

## 🎮 Usage

### Loading a Model
1. Drag and drop a GLTF, GLB, VRM, or VRMA file onto the main viewer
2. Or click the upload area to select a file from your computer
3. The model will load automatically with optimized settings

### Controlling Animations
1. If the model contains animations, the Animation Player will appear in the sidebar
2. Select an animation from the dropdown menu
3. Use play/pause/stop buttons to control playback
4. Adjust playback speed using the speed control
5. Scrub through the timeline by dragging the progress bar

### Loading External Animations
1. Load a base 3D model first
2. In the Animation Player panel, click the small upload icon next to the title
3. Drop or select a VRMA file containing animations
4. The new animations will replace the existing ones and start playing automatically

### Exploring Model Information
- **Model Metadata**: View file size, format, and basic information
- **Structure Info**: See counts of nodes, meshes, materials, and textures
- **Scene Graph**: Explore the hierarchical structure of the 3D scene
- **Materials**: Inspect PBR material properties and textures
- **Extensions**: View used glTF extensions with detailed categorization

### Rendering Controls
- **Wireframe**: Toggle wireframe mode to see the model's geometry
- **Lighting**: Adjust environment lighting, ambient light, and color temperature
- **Grid**: Show/hide the ground grid for spatial reference

## 🛠 Technology Stack

### Frontend
- **Next.js 15.2.4** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - UI components

### 3D Rendering
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React Three.js renderer
- **@react-three/drei** - Three.js utilities

### Future Additions
- **@pixiv/three-vrm** - VRM 1.0 support (planned)

## 📋 Roadmap

### v0.3.0 - VRM/VRMA Support (Q3 2025)
- Three-vrm library integration
- VRM 1.0 complete support
- VRMA animation specialized loader
- VRM metadata display

### v0.4.0 - Material Analysis (Q4 2025)
- Enhanced material inspector
- Texture gallery improvements
- PBR visualization
- Advanced rendering options

### v0.5.0 - Performance & Export (Q1 2026)
- Performance monitoring
- Screenshot capture
- Export options
- Optimization suggestions

### v1.0.0 - Comparison Tools (Q2 2026)
- Model comparison features
- Validation tools
- Change tracking
- Complete feature integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Each source file should be under 1KB
- Use kebab-case for file names
- Components should be small and focused
- Include TypeScript types for all props
- Follow the established folder structure

### File Size Limit
This project maintains a 1KB limit per source file to encourage:
- Small, focused components
- Better maintainability
- Faster loading times
- Easier code review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [glTF Specification](https://www.khronos.org/gltf/)
- [VRM Specification](https://vrm.dev/)

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - Amazing 3D graphics library
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React renderer for Three.js
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components

---

Made with ❤️ for the 3D community
