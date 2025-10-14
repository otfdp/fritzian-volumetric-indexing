# FVI Reference Implementation

This directory contains reference implementations for parsing, generating, and visualizing Fritzian Volumetric Indexing files.

## Contents

### JavaScript/Node.js Library
Core parsing and generation utilities:
- **`javascript/parser.js`** - Parse FVI CSV files into 3D grids
- **`javascript/generator.js`** - Generate FVI files from voxel grids

### Voxelgram Generator (React/Vite)
Interactive web application for creating FVI files from mathematical surfaces:
- **`voxelgram-generator/`** - Full React + Three.js visualization tool

## Quick Start

### Using the JavaScript Library

```bash
# No installation needed - pure ES6 modules
import { parseFVI, validateFVI } from './javascript/parser.js';
import { generateFVI, generateSurfaceGrid, surfaces } from './javascript/generator.js';
```

**Parse an FVI file:**
```javascript
import { parseFVI } from './javascript/parser.js';

const csvContent = await fetch('example.csv').then(r => r.text());
const { grid, gridSize, depthSize, filledVoxels } = parseFVI(csvContent);

console.log(`Loaded ${gridSize}×${gridSize}×${depthSize} grid`);
console.log(`Filled voxels: ${filledVoxels}`);

// Access specific voxel
const voxel = grid[x][y][z];
```

**Generate an FVI file:**
```javascript
import { generateFVI, generateSurfaceGrid, surfaces } from './javascript/generator.js';

// Generate a sphere
const grid = generateSurfaceGrid(
  surfaces.sphere,
  { radius: 6 },
  15,  // grid size
  2    // thickness
);

// Convert to CSV
const csv = generateFVI(grid, {
  includeMetadata: true,
  description: 'A sphere with radius 6'
});

// Save or use the CSV
console.log(csv);
```

### Using the Voxelgram Generator Tool

```bash
cd voxelgram-generator
npm install
npm run dev
```

Then open http://localhost:5173

**Features:**
- 🎨 Generate surfaces from mathematical equations
- 📊 Real-time 3D visualization with Three.js
- ⚙️ Adjustable parameters (size, thickness, shape properties)
- 💾 Download FVI CSV files
- 📈 Statistics (filled voxels, fill rate)

## JavaScript Library API

### Parser Functions

#### `parseFVI(csvContent)`
Parse FVI CSV string into 3D voxel grid.

**Parameters:**
- `csvContent` (string): CSV file content

**Returns:**
```javascript
{
  grid: Array,        // 3D array [x][y][z]
  gridSize: number,   // Size of grid (n for n×n×n)
  depthSize: number,  // Depth dimension
  totalVoxels: number,
  filledVoxels: number
}
```

#### `validateFVI(csvContent)`
Validate FVI file format.

**Returns:**
```javascript
{
  success: boolean,
  errors: Array,
  gridSize: number,
  depthSize: number
}
```

#### `indexToCoordinates(index, gridSize)`
Convert linear index to (x, y) coordinates.

#### `coordinatesToIndex(x, y, gridSize)`
Convert (x, y) coordinates to linear index.

#### `getXPlane(grid, x)` / `getYPlane(grid, y)` / `getZColumn(grid, x, y)`
Extract 2D slices or 1D columns from grid.

### Generator Functions

#### `generateFVI(grid, options)`
Generate FVI CSV from 3D grid.

**Parameters:**
- `grid` (Array): 3D array [x][y][z] with 0s and 1s
- `options` (Object):
  - `includeMetadata` (boolean): Add header comments
  - `formatVersion` (string): FVI version
  - `description` (string): Optional description

**Returns:** CSV string

#### `generateSurfaceGrid(surfaceFunc, params, gridSize, thickness)`
Generate voxel grid from mathematical surface.

**Parameters:**
- `surfaceFunc` (Function): Surface equation
- `params` (Object): Parameters for surface
- `gridSize` (number): Size of cubic grid
- `thickness` (number): Surface thickness in voxels

#### `surfaces`
Pre-built surface functions:
- `surfaces.sphere` - Sphere
- `surfaces.torus` - Torus (donut)
- `surfaces.ellipsoid` - Ellipsoid
- `surfaces.cylinder` - Cylinder
- `surfaces.cone` - Cone
- `surfaces.heart` - Heart shape
- `surfaces.cube` - Cube

#### Utility Functions
- `createEmptyGrid(gridSize)` - Empty grid
- `createFilledGrid(gridSize)` - Filled grid
- `setVoxel(grid, x, y, z, value)` - Set single voxel
- `fillRegion(grid, bounds, value)` - Fill rectangular region
- `countFilledVoxels(grid)` - Count filled voxels

## Complete Examples

### Example 1: Parse and Analyze
```javascript
import { parseFVI, getXPlane } from './javascript/parser.js';

// Load file
const response = await fetch('examples/sphere-15.csv');
const csvContent = await response.text();

// Parse
const { grid, gridSize } = parseFVI(csvContent);

// Get X-plane at position 7 (middle)
const xPlane = getXPlane(grid, 7);

// Analyze the plane
console.log(`X-plane has ${xPlane.flat().filter(v => v).length} filled voxels`);
```

### Example 2: Generate Custom Shape
```javascript
import { generateFVI, createEmptyGrid, fillRegion } from './javascript/generator.js';

// Create a hollow cube
const grid = createEmptyGrid(10);

// Fill outer shell
fillRegion(grid, { x1: 0, y1: 0, z1: 0, x2: 9, y2: 9, z2: 0 }, 1); // Bottom
fillRegion(grid, { x1: 0, y1: 0, z1: 9, x2: 9, y2: 9, z2: 9 }, 1); // Top
fillRegion(grid, { x1: 0, y1: 0, z1: 0, x2: 0, y2: 9, z2: 9 }, 1); // Sides...
fillRegion(grid, { x1: 9, y1: 0, z1: 0, x2: 9, y2: 9, z2: 9 }, 1);
fillRegion(grid, { x1: 0, y1: 0, z1: 0, x2: 9, y2: 0, z2: 9 }, 1);
fillRegion(grid, { x1: 0, y1: 9, z1: 0, x2: 9, y2: 9, z2: 9 }, 1);

// Generate FVI
const csv = generateFVI(grid, {
  includeMetadata: true,
  description: 'Hollow 10×10×10 cube'
});

console.log(csv);
```

### Example 3: Custom Surface Function
```javascript
import { generateFVI, generateSurfaceGrid } from './javascript/generator.js';

// Define custom surface: wavy sphere
function wavySphere(x, y, z, { radius, waveAmplitude, waveFrequency }) {
  const dist = Math.sqrt(x*x + y*y + z*z);
  const wave = waveAmplitude * Math.sin(waveFrequency * Math.atan2(y, x));
  return dist - (radius + wave);
}

// Generate grid
const grid = generateSurfaceGrid(
  wavySphere,
  { radius: 6, waveAmplitude: 1, waveFrequency: 5 },
  15,
  2
);

// Convert to FVI
const csv = generateFVI(grid);
```

### Example 4: Round-Trip Test
```javascript
import { parseFVI, generateFVI } from './javascript/parser.js';
import { generateFVI as genFVI } from './javascript/generator.js';

// Generate
const originalGrid = generateSurfaceGrid(surfaces.sphere, { radius: 6 }, 15, 2);
const csv1 = genFVI(originalGrid);

// Parse
const { grid: parsedGrid } = parseFVI(csv1);

// Regenerate
const csv2 = genFVI(parsedGrid);

// Compare
console.assert(csv1 === csv2, 'Round-trip test failed!');
console.log('Round-trip test passed! ✓');
```

## Voxelgram Generator Tool

The web application provides an interactive interface for:

1. **Surface Selection** - Choose from pre-defined mathematical surfaces
2. **Parameter Adjustment** - Modify surface parameters in real-time
3. **3D Visualization** - See the voxel grid with Three.js
4. **Export** - Download FVI CSV files

### Tech Stack
- React 18
- Vite
- Three.js with @react-three/fiber
- @react-three/drei
- Tailwind CSS

### Building for Production
```bash
cd voxelgram-generator
npm run build
```

Output will be in `dist/` directory.

## Testing

Run tests (when available):
```bash
npm test
```

## Browser Compatibility

- **JavaScript Library**: Works in any ES6+ environment (Node.js 14+, modern browsers)
- **Voxelgram Generator**: Modern browsers with WebGL support (Chrome, Firefox, Safari, Edge)

## Performance Notes

### Parser
- **Time complexity**: O(n³) where n is grid size
- **Space complexity**: O(n³) for storing grid
- **Typical performance**: 
  - 15×15×15 grid: < 1ms
  - 50×50×50 grid: ~50ms
  - 100×100×100 grid: ~500ms

### Generator
- **Surface generation**: O(n³) - must evaluate every voxel
- **CSV generation**: O(n²) - boustrophedon traversal
- **Typical performance**:
  - 15×15×15 grid: ~5ms
  - 50×50×50 grid: ~200ms
  - 100×100×100 grid: ~2s

## Contributing

Improvements welcome! Areas of interest:
- Additional language implementations (Python, Rust, C++, etc.)
- Performance optimizations
- Additional surface equations
- Compression algorithms
- Web Workers for large grids
- CLI tools

## License

MIT License - see LICENSE file in repository root
