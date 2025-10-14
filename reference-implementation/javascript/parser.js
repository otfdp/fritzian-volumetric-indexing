/**
 * Fritzian Volumetric Indexing (FVI) Parser
 * Parses FVI CSV files and reconstructs 3D voxel grids
 */

/**
 * Parse an FVI CSV string into a 3D voxel grid
 * @param {string} csvContent - The CSV file content
 * @returns {Object} Parsed FVI data with grid and metadata
 */
export function parseFVI(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  // Skip header and any comment lines
  const dataLines = lines.filter(line => 
    !line.startsWith('Index,') && 
    !line.startsWith('#') && 
    line.trim().length > 0
  );
  
  if (dataLines.length === 0) {
    throw new Error('FVI file contains no data');
  }
  
  // Parse first line to determine dimensions
  const firstLine = dataLines[0].split(',');
  if (firstLine.length !== 2) {
    throw new Error('Invalid FVI format: expected Index,VoxelString');
  }
  
  const depthSize = firstLine[1].trim().length;
  const gridSize = Math.sqrt(dataLines.length);
  
  if (!Number.isInteger(gridSize)) {
    throw new Error(`Invalid grid: ${dataLines.length} indices is not a perfect square`);
  }
  
  // Initialize 3D grid
  const grid = Array(gridSize).fill(0).map(() => 
    Array(gridSize).fill(0).map(() => 
      Array(depthSize).fill(0)
    )
  );
  
  // Parse each line
  dataLines.forEach((line, idx) => {
    const [indexStr, voxelString] = line.split(',');
    const index = parseInt(indexStr.trim());
    const voxels = voxelString.trim();
    
    // Validate
    if (index !== idx + 1) {
      throw new Error(`Index mismatch: expected ${idx + 1}, got ${index}`);
    }
    
    if (voxels.length !== depthSize) {
      throw new Error(`Inconsistent depth: expected ${depthSize}, got ${voxels.length} at index ${index}`);
    }
    
    if (!/^[01]+$/.test(voxels)) {
      throw new Error(`Invalid voxel string at index ${index}: must contain only 0 and 1`);
    }
    
    // Convert index to (x, y) using boustrophedon pattern
    const { x, y } = indexToCoordinates(index - 1, gridSize);
    
    // Fill Z-axis values
    for (let z = 0; z < depthSize; z++) {
      grid[x][y][z] = parseInt(voxels[z]);
    }
  });
  
  return {
    grid,
    gridSize,
    depthSize,
    totalVoxels: gridSize * gridSize * depthSize,
    filledVoxels: countFilledVoxels(grid)
  };
}

/**
 * Convert linear index to (x, y) coordinates using boustrophedon pattern
 * @param {number} index - Linear index (0-based)
 * @param {number} gridSize - Size of grid
 * @returns {Object} {x, y} coordinates
 */
export function indexToCoordinates(index, gridSize) {
  const y = Math.floor(index / gridSize);
  const x = (y % 2 === 0) 
    ? index % gridSize 
    : gridSize - 1 - (index % gridSize);
  return { x, y };
}

/**
 * Convert (x, y) coordinates to linear index using boustrophedon pattern
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} gridSize - Size of grid
 * @returns {number} Linear index (0-based)
 */
export function coordinatesToIndex(x, y, gridSize) {
  return y * gridSize + ((y % 2 === 0) ? x : (gridSize - 1 - x));
}

/**
 * Count filled voxels in grid
 * @param {Array} grid - 3D voxel grid
 * @returns {number} Count of filled voxels
 */
function countFilledVoxels(grid) {
  return grid.flat(2).filter(v => v === 1).length;
}

/**
 * Extract a Z-column at given (x, y) position
 * @param {Array} grid - 3D voxel grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} Array of voxels along Z-axis
 */
export function getZColumn(grid, x, y) {
  return grid[x][y];
}

/**
 * Extract a Y-plane at given y position
 * @param {Array} grid - 3D voxel grid
 * @param {number} y - Y coordinate
 * @returns {Array} 2D array representing Y-plane
 */
export function getYPlane(grid, y) {
  return grid.map(xSlice => xSlice[y]);
}

/**
 * Extract an X-plane at given x position
 * @param {Array} grid - 3D voxel grid
 * @param {number} x - X coordinate
 * @returns {Array} 2D array representing X-plane
 */
export function getXPlane(grid, x) {
  return grid[x];
}

/**
 * Get indices that form an X-plane (for debugging/verification)
 * @param {number} x - X coordinate
 * @param {number} gridSize - Size of grid
 * @returns {Array} Array of 1-based indices
 */
export function getXPlaneIndices(x, gridSize) {
  const indices = [];
  for (let y = 0; y < gridSize; y++) {
    const rowStart = y * gridSize;
    if (y % 2 === 0) {
      indices.push(rowStart + x + 1);
    } else {
      indices.push(rowStart + (gridSize - 1 - x) + 1);
    }
  }
  return indices;
}

/**
 * Validate FVI file format
 * @param {string} csvContent - The CSV file content
 * @returns {Object} Validation result with success flag and errors
 */
export function validateFVI(csvContent) {
  const errors = [];
  
  try {
    const lines = csvContent.trim().split('\n');
    const dataLines = lines.filter(line => 
      !line.startsWith('Index,') && 
      !line.startsWith('#') && 
      line.trim().length > 0
    );
    
    if (dataLines.length === 0) {
      errors.push('File contains no data');
      return { success: false, errors };
    }
    
    // Check if number of lines is a perfect square
    const gridSize = Math.sqrt(dataLines.length);
    if (!Number.isInteger(gridSize)) {
      errors.push(`Invalid grid: ${dataLines.length} indices is not a perfect square`);
    }
    
    // Check depth consistency
    const firstDepth = dataLines[0].split(',')[1]?.trim().length;
    if (!firstDepth) {
      errors.push('Invalid format: missing VoxelString in first line');
    }
    
    // Validate each line
    dataLines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length !== 2) {
        errors.push(`Line ${idx + 1}: Invalid format, expected 2 fields`);
        return;
      }
      
      const [indexStr, voxelString] = parts;
      const index = parseInt(indexStr.trim());
      const voxels = voxelString.trim();
      
      if (isNaN(index)) {
        errors.push(`Line ${idx + 1}: Invalid index '${indexStr}'`);
      } else if (index !== idx + 1) {
        errors.push(`Line ${idx + 1}: Index ${index} out of sequence (expected ${idx + 1})`);
      }
      
      if (voxels.length !== firstDepth) {
        errors.push(`Line ${idx + 1}: Inconsistent depth (expected ${firstDepth}, got ${voxels.length})`);
      }
      
      if (!/^[01]+$/.test(voxels)) {
        errors.push(`Line ${idx + 1}: Invalid characters in VoxelString (must be only 0 and 1)`);
      }
    });
    
    return {
      success: errors.length === 0,
      errors,
      gridSize: errors.length === 0 ? gridSize : null,
      depthSize: errors.length === 0 ? firstDepth : null
    };
    
  } catch (error) {
    return {
      success: false,
      errors: [error.message]
    };
  }
}

// Example usage:
/*
import { parseFVI, validateFVI } from './parser.js';

// Validate first
const validation = validateFVI(csvContent);
if (!validation.success) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Parse
const { grid, gridSize, depthSize, filledVoxels } = parseFVI(csvContent);
console.log(`Loaded ${gridSize}×${gridSize}×${depthSize} grid`);
console.log(`Filled voxels: ${filledVoxels}`);

// Access specific voxel
const voxel = grid[x][y][z];

// Get planes
const xPlane = getXPlane(grid, 0);
const yPlane = getYPlane(grid, 0);
const zColumn = getZColumn(grid, 0, 0);
*/
