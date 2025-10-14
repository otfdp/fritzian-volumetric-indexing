# FVI Examples

This directory contains example Fritzian Volumetric Indexing files demonstrating various use cases and complexity levels.

## Basic Examples

### simple-cube.csv
A minimal 5×5×5 hollow cube - perfect for understanding the format.
- **Grid Size**: 5×5×5
- **Features**: Hollow interior, all surfaces filled
- **Use Case**: Format introduction, parser testing

### single-voxel.csv
The simplest possible FVI file - a single filled voxel.
- **Grid Size**: 3×3×3
- **Features**: Only center voxel filled
- **Use Case**: Edge case testing, minimal example

### checkerboard.csv
A 3D checkerboard pattern.
- **Grid Size**: 8×8×8
- **Features**: Alternating filled/empty voxels
- **Use Case**: Pattern recognition, algorithmic generation

## Geometric Shapes (15×15×15)

### sphere-15.csv
A sphere centered in the grid.
- **Surface**: Mathematically generated using distance function
- **Thickness**: 2 voxels
- **Parameters**: radius = 6

### torus-15.csv
A donut-shaped torus.
- **Surface**: Major radius = 5, minor radius = 2
- **Thickness**: 2 voxels
- **Use Case**: Complex topology testing

### cylinder-15.csv
A vertical cylinder.
- **Surface**: Radius = 4
- **Thickness**: 2 voxels
- **Orientation**: Along Z-axis

### cone-15.csv
A cone pointing upward.
- **Surface**: 30° angle
- **Thickness**: 2 voxels
- **Features**: Tests variable cross-sections

### ellipsoid-15.csv
An ellipsoid (stretched sphere).
- **Surface**: rx=6, ry=4, rz=5
- **Thickness**: 2 voxels
- **Use Case**: Non-uniform scaling

### heart-15.csv
A 3D heart shape.
- **Surface**: Parametric heart equation
- **Thickness**: 2 voxels
- **Use Case**: Complex mathematical surfaces

## Large Examples (20×20×20)

### sphere-20.csv
Larger sphere with more detail.
- **Grid Size**: 20×20×20
- **Features**: Higher resolution surface
- **Use Case**: Performance testing

### torus-20.csv
Larger torus with finer detail.
- **Grid Size**: 20×20×20
- **Features**: More detailed topology

## Special Cases

### empty-grid.csv
Completely empty grid - no filled voxels.
- **Grid Size**: 5×5×5
- **Features**: All zeros
- **Use Case**: Edge case handling

### full-grid.csv
Completely filled grid.
- **Grid Size**: 5×5×5
- **Features**: All ones
- **Use Case**: Maximum density testing

### single-layer.csv
Only the bottom Z-layer filled.
- **Grid Size**: 5×5×5
- **Features**: Z=0 filled, rest empty
- **Use Case**: 2D-like structures in 3D space

## File Naming Convention

```
<shape>-<size>.csv
```

Examples:
- `sphere-15.csv` - Sphere in 15×15×15 grid
- `torus-20.csv` - Torus in 20×20×20 grid
- `simple-cube.csv` - Basic shape (size implicit from content)

## Using These Examples

### Loading in JavaScript
```javascript
import Papa from 'papaparse';

const response = await fetch('examples/sphere-15.csv');
const text = await response.text();
const { data } = Papa.parse(text, { header: true });
```

### Loading in Python
```python
import csv

with open('examples/sphere-15.csv', 'r') as f:
    reader = csv.DictReader(f)
    data = [(row['Index'], row['VoxelString']) for row in reader]
```

### Validating
Each file should:
- Have correct number of rows (n² for n×n×n grid)
- Have consistent VoxelString length (n)
- Use only '0' and '1' characters
- Have sequential indices starting from 001

## Generating Your Own

Use the reference implementation generator tool to create custom FVI files:

```bash
cd reference-implementation
npm install
npm run dev
```

Or programmatically generate surfaces using the mathematical functions provided in the spec.

## File Size Reference

| Grid Size | Total Indices | File Size (approx) |
|-----------|---------------|-------------------|
| 5×5×5     | 25            | < 1 KB            |
| 10×10×10  | 100           | 2-3 KB            |
| 15×15×15  | 225           | 5-7 KB            |
| 20×20×20  | 400           | 10-12 KB          |
| 50×50×50  | 2,500         | 150-200 KB        |

## Contributing Examples

Have an interesting FVI file? We'd love to include it! Please:
1. Ensure it's valid FVI format
2. Include a descriptive filename
3. Add entry to this README
4. Submit via pull request

Particularly interested in:
- Interesting mathematical surfaces
- Real-world data examples
- Challenging edge cases
- Large-scale datasets
