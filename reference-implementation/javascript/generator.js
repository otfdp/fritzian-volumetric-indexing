/**
 * Fritzian Volumetric Indexing (FVI) Generator
 * Generates FVI CSV files from 3D voxel grids
 */

/**
 * Generate FVI CSV string from 3D voxel grid
 * @param {Array} grid - 3D array [x][y][z] with 0s and 1s
 * @param {Object} options - Generation options
 * @returns {string} CSV content in FVI format
 */
export function generateFVI(grid, options = {}) {
  const {
    includeMetadata = false,
    formatVersion = '1.0',
    description = null
  } = options;
  
  // Validate grid
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error('Grid must be a non-empty 3D array');
  }
  
  const gridSize = grid.length;
  const depthSize = grid[0][0].length;
  
  // Build CSV
  let csv = '';
  
  // Add metadata comments if requested
  if (includeMetadata) {
    csv += `# FVI Format Version: ${formatVersion}\n`;
    csv += `# Grid Size: ${gridSize}x${gridSize}x${depthSize}\n`;
    csv += `# Surface Type: custom\n`;
    csv += `# Creation Date: ${new Date().toISOString().split('T')[0]}\n`;
    if (description) {
      csv += `# Description: ${description}\n`;
    }
  }
  
  // Header
  csv += 'Index,VoxelString\n';
  
  // Generate data rows using boustrophedon pattern
  let index = 1;
  for (let y = 0; y < gridSize; y++) {
    if (y % 2 === 0) {
      // Left to right
      for (let x = 0; x < gridSize; x++) {
        const voxelString = buildVoxelString(grid, x, y, depthSize);
        csv += `${String(index).padStart(3, '0')},${voxelString}\n`;
        index++;
      }
    } else {
      // Right to left
      for (let x = gridSize - 1; x >= 0; x--) {
        const voxelString = buildVoxelString(grid, x, y, depthSize);
        csv += `${String(index).padStart(3, '0')},${voxelString}\n`;
        index++;
      }
    }
  }
  
  return csv;
}

/**
 * Build voxel string for a given (x, y) position
 * @param {Array} grid - 3D voxel grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} depthSize - Depth of grid
 * @returns {string} Binary string representing Z-column
 */
function buildVoxelString(grid, x, y, depthSize) {
  let str = '';
  for (let z = 0; z < depthSize; z++) {
    str += grid[x][y][z] ? '1' : '0';
  }
  return str;
}

/**
 * Generate voxel grid from mathematical surface
 * @param {Function} surfaceFunc - Function(x, y, z, params) that returns distance from surface
 * @param {Object} params - Parameters for surface function
 * @param {number} gridSize - Size of cubic grid
 * @param {number} thickness - Thickness of surface in voxels
 * @returns {Array} 3D voxel grid
 */
export function generateSurfaceGrid(surfaceFunc, params, gridSize, thickness = 2) {
  const grid = Array(gridSize).fill(0).map(() => 
    Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0)
    )
  );
  
  const offset = gridSize / 2;
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        // Convert to centered coordinates
        const wx = x - offset;
        const wy = y - offset;
        const wz = z - offset;
        
        // Evaluate surface function
        const value = surfaceFunc(wx, wy, wz, params);
        
        // Fill if within thickness threshold
        if (Math.abs(value) <= thickness / 2) {
          grid[x][y][z] = 1;
        }
      }
    }
  }
  
  return grid;
}

/**
 * Mathematical surface functions
 */
export const surfaces = {
  sphere: (x, y, z, { radius }) => {
    return Math.sqrt(x*x + y*y + z*z) - radius;
  },
  
  torus: (x, y, z, { majorRadius, minorRadius }) => {
    const q = Math.sqrt(x*x + y*y) - majorRadius;
    return Math.sqrt(q*q + z*z) - minorRadius;
  },
  
  ellipsoid: (x, y, z, { rx, ry, rz }) => {
    return (x*x)/(rx*rx) + (y*y)/(ry*ry) + (z*z)/(rz*rz) - 1;
  },
  
  cylinder: (x, y, z, { radius }) => {
    return Math.sqrt(x*x + y*y) - radius;
  },
  
  cone: (x, y, z, { angle }) => {
    return Math.sqrt(x*x + y*y) - z * Math.tan(angle * Math.PI / 180);
  },
  
  heart: (x, y, z, { scale }) => {
    const sx = x / scale, sy = y / scale, sz = z / scale;
    return Math.pow(sx*sx + 9/4*sy*sy + sz*sz - 1, 3) - sx*sx*sz*sz*sz - 9/80*sy*sy*sz*sz*sz;
  },
  
  cube: (x, y, z, { size }) => {
    const dx = Math.abs(x) - size/2;
    const dy = Math.abs(y) - size/2;
    const dz = Math.abs(z) - size/2;
    return Math.max(dx, dy, dz);
  }
};

/**
 * Create an empty grid
 * @param {number} gridSize - Size of cubic grid
 * @returns {Array} 3D voxel grid filled with zeros
 */
export function createEmptyGrid(gridSize) {
  return Array(gridSize).fill(0).map(() => 
    Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0)
    )
  );
}

/**
 * Create a filled grid
 * @param {number} gridSize - Size of cubic grid
 * @returns {Array} 3D voxel grid filled with ones
 */
export function createFilledGrid(gridSize) {
  return Array(gridSize).fill(0).map(() => 
    Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(1)
    )
  );
}

/**
 * Set a single voxel in grid
 * @param {Array} grid - 3D voxel grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {number} value - 0 or 1
 */
export function setVoxel(grid, x, y, z, value) {
  if (x < 0 || x >= grid.length || 
      y < 0 || y >= grid[0].length || 
      z < 0 || z >= grid[0][0].length) {
    throw new Error(`Coordinates out of bounds: (${x}, ${y}, ${z})`);
  }
  grid[x][y][z] = value ? 1 : 0;
}

/**
 * Fill a rectangular region
 * @param {Array} grid - 3D voxel grid
 * @param {Object} bounds - {x1, y1, z1, x2, y2, z2}
 * @param {number} value - 0 or 1
 */
export function fillRegion(grid, { x1, y1, z1, x2, y2, z2 }, value = 1) {
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      for (let z = z1; z <= z2; z++) {
        setVoxel(grid, x, y, z, value);
      }
    }
  }
}

/**
 * Count filled voxels in grid
 * @param {Array} grid - 3D voxel grid
 * @returns {number} Count of filled voxels
 */
export function countFilledVoxels(grid) {
  return grid.flat(2).filter(v => v === 1).length;
}

// Example usage:
/*
import { generateFVI, generateSurfaceGrid, surfaces } from './generator.js';

// Generate a sphere
const grid = generateSurfaceGrid(
  surfaces.sphere,
  { radius: 6 },
  15,
  2
);

// Convert to FVI format
const csv = generateFVI(grid, {
  includeMetadata: true,
  description: 'A sphere with radius 6'
});

// Save or use the CSV
console.log(csv);

// Or create custom grid
const customGrid = createEmptyGrid(5);
setVoxel(customGrid, 2, 2, 2, 1); // Center voxel
const customCSV = generateFVI(customGrid);
*/
