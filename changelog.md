# Changelog

All notable changes to Fritzian Volumetric Indexing will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional reference implementations (Python, Rust, C++)
- Compression algorithms optimized for FVI format
- Format converters for popular voxel formats
- Performance benchmarks
- Extended examples and tutorials

## [1.0.0] - 2024-10-13

### Added
- Initial specification for Fritzian Volumetric Indexing
- Planar implementation with boustrophedon traversal
- CSV file format specification
- Mathematical formulation for all three axis traversals
- Conceptual framework for spherical implementation
- Reference implementation in JavaScript/React
- Surface generator tool (sphere, torus, ellipsoid, cylinder, cone, heart)
- Comprehensive documentation (README.md, SPECIFICATION.md)
- MIT License
- Contributing guidelines
- Example FVI files

### Core Features
- Bidirectional depth projection (±n from surface)
- Deterministic index-to-coordinate mapping
- Human-readable CSV format
- Z-axis traversal (trivial - direct string read)
- Y-axis traversal (simple - contiguous slices)
- X-axis traversal (computed - boustrophedon-aware)

### Documentation
- Technical specification with formal mathematical proofs
- Algorithm complexity analysis
- Implementation guidelines
- Parser and generator requirements
- File format validation rules

### Design Decisions
- Zero-padded indices for consistent sorting
- Binary strings for voxel encoding
- CSV format for human readability and version control
- Right-handed Cartesian coordinate system
- Isometric view conventions (X: down-right, Y: down-left, Z: up)

---

## Version History Summary

- **1.0.0** (2024-10-13): Initial release with complete planar specification
- **Future**: Spherical implementation, additional tools, community contributions

---

## Notes on Versioning

### Major Version (X.0.0)
Breaking changes that affect:
- File format structure
- Index-to-coordinate mapping
- Core traversal algorithms
- Backward compatibility with existing FVI files

### Minor Version (0.X.0)
Backward-compatible additions:
- New optional metadata fields
- Additional surface types
- New reference implementations
- Extended documentation

### Patch Version (0.0.X)
Non-breaking fixes:
- Documentation clarifications
- Bug fixes in reference implementations
- Typo corrections
- Example updates

---

## Migration Guides

### Future Migrations
Migration guides will be provided for any breaking changes in future major versions.

---

## Acknowledgments

### Contributors
- Michael Raymond Fritz - Original concept and specification
- Community contributors (see GitHub contributors page)

### Inspiration
- Nonogram/Picross puzzles
- Voxel-based game engines
- Medical imaging formats (DICOM, NIfTI)
- Township and Range land surveying system

### Special Thanks
- Build by Voxelgram game project (first implementation)
- Open source community for feedback and contributions

---

[Unreleased]: https://github.com/otfdp/fritzian-volumetric-indexing/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/otfdp/fritzian-volumetric-indexing/releases/tag/v1.0.0
