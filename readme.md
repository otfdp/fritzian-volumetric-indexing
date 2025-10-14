# Fritzian Volumetric Indexing (FVI)

A human-readable, deterministic format for encoding volumetric voxel data using continuous surface traversal and bidirectional depth projection.

## Overview

Fritzian Volumetric Indexing provides a standardized way to represent 3D volumetric data as linearized sequences. Unlike arbitrary flat array indexing or domain-specific formats, FVI uses a natural reference frame (a surface) and creates a continuous traversal path that is both human-readable and mathematically rigorous.

## Core Concepts

### 1. Reference Surface
Any closed surface serves as the zero-reference plane. For planar implementations, this is typically the XY plane at Z=0.

### 2. Bidirectional Projection
Each vertex on the reference surface projects both inward (negative indices) and outward (positive indices) at regular intervals:
- **0**: The surface itself
- **Positive (+1, +2, ...)**: Outward projection (atmosphere, exterior)
- **Negative (-1, -2, ...)**: Inward projection (subsurface, interior)

### 3. Continuous Traversal
A deterministic path across the surface eliminates indexing ambiguity. For rectangular grids, this uses a boustrophedon (zigzag) pattern.

## Planar Implementation

### Coordinate System
- **X-axis**: Primary horizontal axis (in isometric view: down-right)
- **Y-axis**: Secondary horizontal axis (in isometric view: down-left)
- **Z-axis**: Vertical axis (up)

### Boustrophedon Pattern
Starting at origin (0,0,0), traverse the XY plane:
```
Row 0 (Y=0):  X → (0 to n-1)      [Indices: 1 to n]
Row 1 (Y=1):  X ← (n-1 to 0)      [Indices: n+1 to 2n]
Row 2 (Y=2):  X → (0 to n-1)      [Indices: 2n+1 to 3n]
Row 3 (Y=3):  X ← (n-1 to 0)      [Indices: 3n+1 to 4n]
...
```

For a grid of size n×n, total indices = n²

### Depth Strings
Each index position corresponds to a column extending through the Z-axis (or other depth axis). The depth string is encoded as binary digits representing filled (1) or empty (0) voxels.

## File Format

### CSV Structure
```csv
Index,VoxelString
001,101100111010110
002,110010001111010
003,010111000101110
...
225,011100010111001
```

- **Index**: Zero-padded sequential number following boustrophedon pattern
- **VoxelString**: Binary string of length n, representing voxels along depth axis

### Example (5×5×5 grid)
```csv
Index,VoxelString
001,10110
002,11001
003,01110
004,00111
005,11010
006,01011  ← Note: Row 1 reverses
007,10101
...
025,11100
```

## Axis Traversal Algorithms

### Z-Axis Traversal (Trivial)
Read each VoxelString left to right:
```javascript
function getZColumn(index, voxelStrings) {
  return voxelStrings[index].split('').map(d => parseInt(d));
}
```

### Y-Axis Traversal (Simple)
Every n indices represents one complete Y-level:
```javascript
function getYPlane(y, gridSize, voxelStrings) {
  const startIndex = y * gridSize;
  return voxelStrings.slice(startIndex, startIndex + gridSize);
}
```

### X-Axis Traversal (Computed)
Accounts for boustrophedon alternation:
```javascript
function getXPlaneIndices(x, gridSize) {
  const indices = [];
  for (let y = 0; y < gridSize; y++) {
    const rowStart = y * gridSize;
    if (y % 2 === 0) {
      // Even row: left to right
      indices.push(rowStart + x);
    } else {
      // Odd row: right to left
      indices.push(rowStart + (gridSize - 1 - x));
    }
  }
  return indices;
}
```

**Mathematical formulation:**
```
index(x, y) = y × n + (y mod 2 = 0 ? x : (n - 1 - x))
```

Where the alternation follows a discrete oscillation pattern that can be expressed using modulo arithmetic or sign functions.

## Spherical Implementation

### Concept
For closed surfaces like spheres, ellipsoids, or arbitrary manifolds:

1. **Surface Parameterization**: Define vertices on the surface (e.g., lat/long grid for spheres)
2. **Traversal Path**: Pole-to-pole meridian zigzag
   - Start at North Pole
   - Trace longitude 0° (pole to pole)
   - Jump to next longitude slice
   - Trace back (pole to pole)
   - Continue zigzag through 360°
3. **Radial Projection**: Each surface vertex projects inward/outward along its normal vector

This creates a surface-agnostic indexing system where the surface itself is the reference frame.

## Applications

### Game Development
- **Voxel puzzle games** (e.g., 3D nonogram/picross puzzles)
- **Procedural generation** with readable serialization
- **Level design** tools with human-editable formats

### Scientific Computing
- **Planetary science**: Atmospheric layers, crustal depth relative to surface
- **Medical imaging**: Organ surfaces with tissue depth encoding
- **Materials science**: Surface coatings, corrosion analysis
- **Geophysics**: Subsurface structure relative to terrain

### Data Visualization
- **Version control friendly**: Text-based format shows meaningful diffs
- **Human debuggable**: Index numbers map to intuitive positions
- **Compression ready**: Binary strings compress well

## Properties

### Mathematical Properties
- **Bijective**: One-to-one mapping between indices and 3D coordinates
- **Continuous**: Traversal path has no discontinuous jumps
- **Deterministic**: Same input always produces same output
- **Scalable**: Works for arbitrary grid sizes

### Practical Properties
- **Human-readable**: Index numbers are sequential and predictable
- **Git-friendly**: Text format with meaningful line-by-line changes
- **Parseable**: Simple CSV structure
- **Extensible**: Can add metadata columns without breaking format

## Implementation Examples

See `/examples` directory for:
- JavaScript/React reference implementation
- Python parser and generator
- Mathematical surface generators (sphere, torus, ellipsoid, etc.)
- File format converters

## Contributing

Contributions welcome! Areas of interest:
- Additional traversal patterns (Hilbert curve, spiral, etc.)
- Compression algorithms optimized for FVI format
- Converters to/from existing voxel formats
- Mathematical proofs of properties
- Applications in new domains

## License

MIT License - see LICENSE file

## Citation

If you use Fritzian Volumetric Indexing in research or publications, please cite:

```
Fritzian Volumetric Indexing: A Surface-Relative Framework for Volumetric Data Encoding
https://github.com/[your-username]/fritzian-volumetric-indexing
```

## Author

Created by [Your Name] for the game "Build by Voxelgram"

---

*Named "Fritzian" after the inventor's approach to creating deterministic, human-readable volumetric indexing through continuous surface traversal.*
