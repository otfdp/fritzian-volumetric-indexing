# Fritzian Volumetric Indexing - Technical Specification v1.0

## Abstract

This document provides the formal specification for Fritzian Volumetric Indexing (FVI), a method for encoding volumetric data using surface-relative reference frames and continuous traversal patterns.

## 1. Motivation

### 1.1 Problem Statement
Existing volumetric data formats suffer from:
- **Arbitrary indexing**: Flat arrays provide no spatial intuition
- **Domain-specific design**: Medical imaging formats (DICOM, NIfTI) don't generalize
- **Poor human readability**: Binary formats are not version-control friendly
- **Lack of surface context**: No natural reference frame for depth measurements

### 1.2 Design Goals
- Human-readable text format
- Deterministic bidirectional mapping between linear indices and 3D coordinates
- Surface-relative depth encoding
- Version control friendly (meaningful diffs)
- Scalable to arbitrary resolutions
- Extensible to non-planar surfaces

## 2. Conceptual Framework

### 2.1 Reference Surface
**Definition**: A reference surface S is a 2-manifold embedded in 3D space that serves as the zero-level for depth measurements.

**Properties**:
- For planar implementations: S is a plane (typically XY at Z=0)
- For spherical implementations: S is a closed surface (sphere, ellipsoid, etc.)
- S contains a finite set of vertices V = {v₁, v₂, ..., vₙ}

### 2.2 Depth Projection
**Definition**: Each vertex vᵢ ∈ S projects along a direction vector d⃗ᵢ at regular intervals.

**Parameterization**:
- **Depth levels**: Integer values k ∈ ℤ
- **k = 0**: The surface vertex itself
- **k > 0**: Outward projection (k steps along +d⃗ᵢ)
- **k < 0**: Inward projection (k steps along -d⃗ᵢ)

**Coordinate formula**:
```
position(vᵢ, k) = vᵢ + k · Δ · d⃗ᵢ
```
where Δ is the voxel spacing.

### 2.3 Continuous Traversal
**Definition**: A continuous traversal T is a bijective function mapping sequential indices to surface vertices:

```
T: ℕ → V
T(i) = vⱼ for unique j
```

**Requirements**:
- **Bijective**: Every vertex visited exactly once
- **Continuous**: Adjacent indices map to spatially adjacent vertices
- **Deterministic**: Same traversal order for same input surface

## 3. Planar Implementation

### 3.1 Coordinate System

**Right-handed Cartesian coordinates**:
- X-axis: Primary horizontal (isometric: down-right)
- Y-axis: Secondary horizontal (isometric: down-left)
- Z-axis: Vertical (up)

**Origin**: (0, 0, 0) at corner of grid

### 3.2 Grid Parameterization

**Discrete grid**: n × n vertices on XY plane at Z=0
- X ∈ {0, 1, 2, ..., n-1}
- Y ∈ {0, 1, 2, ..., n-1}
- Z ∈ {0, 1, 2, ..., m-1} where m is depth resolution

**Total voxels**: n × n × m

### 3.3 Boustrophedon Traversal

**Definition**: Alternating left-to-right and right-to-left traversal of rows.

**Formal specification**:
```
T(i) = (x, y) where:
  y = ⌊i / n⌋
  x = {
    i mod n           if y is even
    n - 1 - (i mod n) if y is odd
  }
```

**Index formula** (inverse mapping):
```
index(x, y) = y × n + {
  x           if y mod 2 = 0
  n - 1 - x   if y mod 2 = 1
}
```

**Visual representation** (5×5 example):
```
 1  2  3  4  5
10  9  8  7  6
11 12 13 14 15
20 19 18 17 16
21 22 23 24 25
```

### 3.4 Depth Encoding

**Binary string**: Each index i has an associated depth string Dᵢ of length m:
```
Dᵢ = d₁d₂...dₘ where dⱼ ∈ {0, 1}
```

**Interpretation**:
- dⱼ = 1: Voxel is filled at depth level j
- dⱼ = 0: Voxel is empty at depth level j

**3D reconstruction**:
```
voxel(x, y, z) = Dᵢ[z] where i = index(x, y)
```

## 4. File Format Specification

### 4.1 CSV Structure

**Format**: Comma-separated values (CSV)
**Encoding**: UTF-8
**Line endings**: LF (Unix) or CRLF (Windows)

**Header row**:
```
Index,VoxelString
```

**Data rows**:
```
<index>,<binary_string>
```

### 4.2 Field Specifications

**Index field**:
- Type: Zero-padded integer
- Range: 001 to n² (inclusive)
- Padding: Minimum 3 digits (e.g., 001, 042, 225)
- Purpose: Sequential identifier following boustrophedon pattern

**VoxelString field**:
- Type: Binary string
- Length: Exactly m characters
- Characters: '0' or '1' only
- Purpose: Encodes filled/empty voxels along depth axis

### 4.3 Example File (5×5×5 grid)

```csv
Index,VoxelString
001,10110
002,11001
003,01110
004,00111
005,11010
006,01011
007,10101
008,11110
009,00011
010,10100
...
025,11100
```

### 4.4 Metadata (Optional Extension)

**Extended header** (optional):
```csv
# FVI Format Version: 1.0
# Grid Size: 15x15x15
# Surface Type: planar
# Creation Date: 2024-10-13
Index,VoxelString
001,101100111010110
...
```

Comments starting with '#' are ignored by parsers.

## 5. Axis Traversal Algorithms

### 5.1 Z-Axis (Depth) Traversal

**Complexity**: O(1) per voxel
**Method**: Direct string indexing

```python
def get_z_column(index, voxel_strings):
    """Returns list of voxels along Z-axis at given index"""
    return [int(d) for d in voxel_strings[index]]
```

### 5.2 Y-Axis Traversal

**Complexity**: O(n) per plane
**Method**: Contiguous slice extraction

```python
def get_y_plane(y, grid_size, voxel_strings):
    """Returns all voxel strings for Y-plane y"""
    start_index = y * grid_size
    end_index = start_index + grid_size
    return voxel_strings[start_index:end_index]
```

### 5.3 X-Axis Traversal

**Complexity**: O(n) per plane
**Method**: Alternating offset calculation

```python
def get_x_plane_indices(x, grid_size):
    """Returns list of indices forming X-plane x"""
    indices = []
    for y in range(grid_size):
        row_start = y * grid_size
        if y % 2 == 0:
            # Even row: left to right
            indices.append(row_start + x)
        else:
            # Odd row: right to left
            indices.append(row_start + (grid_size - 1 - x))
    return indices

def get_x_plane(x, grid_size, voxel_strings):
    """Returns voxel data for X-plane x"""
    indices = get_x_plane_indices(x, grid_size)
    return [voxel_strings[i] for i in indices]
```

**Mathematical formulation**:
```
For X-plane at position x:
  indices = {i | i = y·n + f(x,y), y ∈ [0,n)}
  
where f(x,y) = {
  x         if y mod 2 = 0
  n - 1 - x if y mod 2 = 1
}
```

## 6. Spherical Implementation (Conceptual)

### 6.1 Surface Parameterization

**Spherical coordinates**:
- θ ∈ [0, 2π): Longitude (azimuthal angle)
- φ ∈ [0, π]: Latitude (polar angle)
- r: Radius (depth)

**Surface vertices**:
```
V = {(θᵢ, φⱼ) | i ∈ [0,nθ), j ∈ [0,nφ)}
```

### 6.2 Meridian Traversal

**Pole-to-pole zigzag**:
1. Start at North Pole (φ=0, θ=0)
2. Traverse along θ=0 from φ=0 to φ=π
3. Jump to θ=Δθ
4. Traverse along θ=Δθ from φ=π to φ=0 (reverse)
5. Continue zigzag through θ=2π

**Index formula**:
```
index(θᵢ, φⱼ) = i·nφ + {
  j         if i is even
  nφ - 1 - j if i is odd
}
```

### 6.3 Radial Projection

**Direction vector**: Surface normal at each vertex
```
d⃗(θ,φ) = (sin φ cos θ, sin φ sin θ, cos φ)
```

**Depth encoding**:
- Positive indices: Radially outward
- Negative indices: Radially inward
- Zero: Surface itself

## 7. Properties and Proofs

### 7.1 Bijectivity

**Theorem**: The mapping between indices and 3D coordinates is bijective.

**Proof sketch**:
- The boustrophedon pattern visits each (x,y) pair exactly once
- Each (x,y) pair maps to unique index via index(x,y) formula
- Depth coordinate z is independent, mapped via string position
- Therefore (x,y,z) ↔ (index, z-position) is bijective ∎

### 7.2 Continuity

**Theorem**: Adjacent indices map to spatially adjacent vertices (in taxicab metric).

**Proof sketch**:
- Within a row: consecutive indices differ by ±1 in X coordinate
- Between rows: last index of row y and first of row y+1 differ by 1 in Y coordinate
- Maximum spatial distance between consecutive indices is √2 (diagonal) ∎

### 7.3 Determinism

**Theorem**: Same input grid always produces same index assignment.

**Proof**: The algorithm is purely functional with no random elements ∎

## 8. Implementation Guidelines

### 8.1 Parser Requirements

**Minimal parser must**:
- Read CSV format (header + data rows)
- Parse zero-padded integers
- Parse binary strings
- Validate string length consistency
- Handle line ending variations (LF/CRLF)

### 8.2 Generator Requirements

**Minimal generator must**:
- Accept 3D boolean array as input
- Apply boustrophedon ordering
- Convert depth columns to binary strings
- Format indices with zero-padding
- Output valid CSV

### 8.3 Error Handling

**Required validation**:
- Grid size is consistent (n² indices)
- All VoxelStrings have same length m
- VoxelStrings contain only '0' and '1'
- Indices are sequential from 1 to n²

## 9. Extensions and Future Work

### 9.1 Compression
- Run-length encoding of binary strings
- Delta encoding for similar adjacent columns
- Dictionary-based compression for repeated patterns

### 9.2 Alternative Traversal Patterns
- Hilbert curve (better spatial locality)
- Spiral patterns (for circular surfaces)
- Z-order curve (Morton encoding)

### 9.3 Multi-valued Voxels
- Extend beyond binary to grayscale (0-255)
- Material IDs (categorical data)
- Floating-point density values

### 9.4 Temporal Dimension
- Frame-based sequences for animated voxels
- Delta encoding between frames

## 10. Versioning

**Current version**: 1.0

**Version history**:
- 1.0 (2024): Initial specification

**Compatibility policy**:
- Major version changes may break backward compatibility
- Minor version changes are backward compatible
- Implementations should specify supported version

---

## Appendix A: Reference Implementation

See `/reference-implementation` directory for:
- JavaScript parser and generator
- Python parser and generator
- Test suite with validation cases
- Performance benchmarks

## Appendix B: Mathematical Notation

| Symbol | Meaning |
|--------|---------|
| ℕ | Natural numbers (positive integers) |
| ℤ | Integers |
| ⌊x⌋ | Floor function |
| d⃗ | Vector |
| ∈ | Element of (set membership) |
| × | Cartesian product |
| mod | Modulo operation |

## Appendix C: Glossary

- **Boustrophedon**: Ancient Greek writing style alternating direction each line (literally "ox-turning", like plowing a field)
- **Bijective**: One-to-one correspondence
- **Manifold**: Topological space locally resembling Euclidean space
- **Voxel**: Volume element (3D pixel)
- **Traversal**: Path through a set of points

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Status**: Draft Specification
