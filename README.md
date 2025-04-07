# Game Launcher

A modern, feature-rich game launcher built with Electron, React, and Material-UI.

## Features

- 🎮 Automatic game detection and management
- 🌓 Dark/Light theme support
- 🔍 Search and filter games
- 📂 Multiple view modes (Grid/List)
- 🏷️ Game categorization and tagging
- ⭐ Favorite games
- 📊 Game statistics (play time, launch count)
- 🔄 Automatic updates
- 💻 Cross-platform support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vwtfafa/gameluncher.git
cd gameluncher
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Building

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

The built application will be available in the `dist` directory.

## Development

- `npm run dev` - Start the development server
- `npm run watch` - Watch for file changes
- `npm run clean` - Clean the build directory
- `npm run build` - Build the application

## Project Structure

```
gameluncher/
├── src/               # Source code
│   ├── main.ts       # Electron main process
│   ├── preload.ts    # Preload script
│   ├── App.tsx       # Main React component
│   └── renderer.tsx  # React entry point
├── dist/             # Compiled files
├── build/            # Build resources
└── app/              # Application resources
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/)
