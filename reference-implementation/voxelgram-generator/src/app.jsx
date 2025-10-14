import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Mathematical surface functions
const surfaces = {
  sphere: (x, y, z, params) => {
    const { radius } = params;
    return Math.sqrt(x*x + y*y + z*z) - radius;
  },
  torus: (x, y, z, params) => {
    const { majorRadius, minorRadius } = params;
    const q = Math.sqrt(x*x + y*y) - majorRadius;
    return Math.sqrt(q*q + z*z) - minorRadius;
  },
  ellipsoid: (x, y, z, params) => {
    const { rx, ry, rz } = params;
    return (x*x)/(rx*rx) + (y*y)/(ry*ry) + (z*z)/(rz*rz) - 1;
  },
  cylinder: (x, y, z, params) => {
    const { radius } = params;
    return Math.sqrt(x*x + y*y) - radius;
  },
  cone: (x, y, z, params) => {
    const { angle } = params;
    return Math.sqrt(x*x + y*y) - z * Math.tan(angle * Math.PI / 180);
  },
  heart: (x, y, z, params) => {
    const { scale } = params;
    const sx = x / scale, sy = y / scale, sz = z / scale;
    return Math.pow(sx*sx + 9/4*sy*sy + sz*sz - 1, 3) - sx*sx*sz*sz*sz - 9/80*sy*sy*sz*sz*sz;
  }
};

const surfaceParams = {
  sphere: { radius: 6 },
  torus: { majorRadius: 5, minorRadius: 2 },
  ellipsoid: { rx: 6, ry: 4, rz: 5 },
  cylinder: { radius: 4 },
  cone: { angle: 30 },
  heart: { scale: 3 }
};

function VoxelGrid({ voxels, gridSize }) {
  const instancedMeshRef = useRef();
  
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const offset = gridSize / 2;
    let index = 0;
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          if (voxels[x][y][z]) {
            tempObject.position.set(x - offset, y - offset, z - offset);
            tempObject.updateMatrix();
            instancedMeshRef.current.setMatrixAt(index, tempObject.matrix);
            index++;
          }
        }
      }
    }
    
    instancedMeshRef.current.count = index;
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [voxels, gridSize]);
  
  const filledCount = voxels.flat(2).filter(v => v).length;
  
  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, filledCount]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color="#4a9eff" />
    </instancedMesh>
  );
}

function VoxelgramGenerator() {
  const [gridSize, setGridSize] = useState(15);
  const [surfaceType, setSurfaceType] = useState('sphere');
  const [thickness, setThickness] = useState(2);
  const [voxels, setVoxels] = useState(null);
  const [params, setParams] = useState(surfaceParams.sphere);
  const [csvData, setCsvData] = useState('');
  
  const generateVoxels = () => {
    const grid = Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0).map(() => 
        Array(gridSize).fill(0)
      )
    );
    
    const offset = gridSize / 2;
    const surfaceFunc = surfaces[surfaceType];
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const wx = x - offset;
          const wy = y - offset;
          const wz = z - offset;
          
          const value = surfaceFunc(wx, wy, wz, params);
          
          if (Math.abs(value) <= thickness / 2) {
            grid[x][y][z] = 1;
          }
        }
      }
    }
    
    setVoxels(grid);
    generateCSV(grid);
  };
  
  const generateCSV = (grid) => {
    let csv = '# FVI Format Version: 1.0\n';
    csv += `# Grid Size: ${gridSize}x${gridSize}x${gridSize}\n`;
    csv += `# Surface Type: ${surfaceType}\n`;
    csv += `# Creation Date: ${new Date().toISOString().split('T')[0]}\n`;
    csv += 'Index,VoxelString\n';
    
    let index = 1;
    
    for (let y = 0; y < gridSize; y++) {
      if (y % 2 === 0) {
        for (let x = 0; x < gridSize; x++) {
          let voxelString = '';
          for (let z = 0; z < gridSize; z++) {
            voxelString += grid[x][y][z];
          }
          csv += `${String(index).padStart(3, '0')},${voxelString}\n`;
          index++;
        }
      } else {
        for (let x = gridSize - 1; x >= 0; x--) {
          let voxelString = '';
          for (let z = 0; z < gridSize; z++) {
            voxelString += grid[x][y][z];
          }
          csv += `${String(index).padStart(3, '0')},${voxelString}\n`;
          index++;
        }
      }
    }
    
    setCsvData(csv);
  };
  
  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${surfaceType}-${gridSize}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const updateParam = (key, value) => {
    setParams({ ...params, [key]: parseFloat(value) });
  };
  
  useEffect(() => {
    setParams(surfaceParams[surfaceType]);
  }, [surfaceType]);
  
  const filledVoxels = voxels ? voxels.flat(2).filter(v => v).length : 0;
  
  return (
    <div className="app-container">
      <div className="header">
        <h1>FVI Voxelgram Generator</h1>
        
        <div className="controls-grid">
          <div className="control-group">
            <label>Grid Size</label>
            <select 
              value={gridSize} 
              onChange={(e) => setGridSize(parseInt(e.target.value))}
            >
              <option value={15}>15×15×15</option>
              <option value={20}>20×20×20</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Surface Type</label>
            <select 
              value={surfaceType} 
              onChange={(e) => setSurfaceType(e.target.value)}
            >
              <option value="sphere">Sphere</option>
              <option value="torus">Torus</option>
              <option value="ellipsoid">Ellipsoid</option>
              <option value="cylinder">Cylinder</option>
              <option value="cone">Cone</option>
              <option value="heart">Heart</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Thickness</label>
            <input 
              type="number" 
              value={thickness} 
              onChange={(e) => setThickness(parseFloat(e.target.value))}
              min="1"
              max="5"
              step="0.5"
            />
          </div>
          
          {Object.keys(params).map(key => (
            <div key={key} className="control-group">
              <label>{key}</label>
              <input 
                type="number" 
                value={params[key]} 
                onChange={(e) => updateParam(key, e.target.value)}
                step="0.5"
              />
            </div>
          ))}
        </div>
        
        <div className="button-row">
          <button onClick={generateVoxels} className="btn-primary">
            Generate Surface
          </button>
          
          {voxels && (
            <button onClick={downloadCSV} className="btn-success">
              Download CSV
            </button>
          )}
          
          {voxels && (
            <div className="stats">
              <span>Filled Voxels: <strong>{filledVoxels}</strong></span>
              <span>Total: <strong>{gridSize ** 3}</strong></span>
              <span>Fill Rate: <strong>{((filledVoxels / (gridSize ** 3)) * 100).toFixed(1)}%</strong></span>
            </div>
          )}
        </div>
      </div>
      
      <div className="canvas-container">
        {voxels ? (
          <Canvas camera={{ position: [gridSize, gridSize, gridSize], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <VoxelGrid voxels={voxels} gridSize={gridSize} />
            <OrbitControls />
            <gridHelper args={[gridSize * 2, gridSize * 2]} />
          </Canvas>
        ) : (
          <div className="empty-state">
            <p>Click "Generate Surface" to create a voxel grid</p>
          </div>
        )}
      </div>
      
      {csvData && (
        <div className="preview-panel">
          <h3>CSV Preview (first 10 lines):</h3>
          <pre>{csvData.split('\n').slice(0, 11).join('\n')}</pre>
        </div>
      )}
    </div>
  );
}

export default VoxelgramGenerator;