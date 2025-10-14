# Contributing to Fritzian Volumetric Indexing

Thank you for your interest in contributing to FVI! This document provides guidelines for contributing to the specification, reference implementations, and related tools.

## Ways to Contribute

### 1. Specification Improvements
- Clarify ambiguous language
- Add examples and use cases
- Identify edge cases
- Propose extensions or optimizations
- Fix typos or formatting issues

### 2. Reference Implementations
- Add parsers in new languages
- Optimize existing implementations
- Improve error handling
- Add comprehensive test suites
- Create benchmarks

### 3. Tools and Utilities
- Format converters (e.g., FVI ↔ other voxel formats)
- Visualization tools
- Compression algorithms
- Validation tools
- Editor plugins

### 4. Documentation
- Tutorials and guides
- Real-world examples
- Performance comparisons
- Integration guides for popular frameworks

### 5. Applications
- Share projects using FVI
- Case studies
- Performance analysis
- Novel use cases

## Getting Started

### Reporting Issues
Before creating an issue:
1. Check existing issues to avoid duplicates
2. Use a clear, descriptive title
3. Include relevant details:
   - What you expected
   - What actually happened
   - Steps to reproduce
   - Environment (OS, language version, etc.)

### Suggesting Enhancements
Enhancement suggestions are welcome! Please:
1. Explain the problem you're trying to solve
2. Describe your proposed solution
3. Consider backward compatibility
4. Provide examples if possible

## Development Process

### For Specification Changes

**Major Changes** (breaking compatibility):
1. Open an issue for discussion first
2. Wait for community feedback
3. Create a draft proposal
4. Submit a pull request with:
   - Updated SPECIFICATION.md
   - Rationale for changes
   - Migration guide from previous version

**Minor Changes** (clarifications, examples):
1. Fork the repository
2. Make your changes
3. Submit a pull request
4. Address review feedback

### For Code Contributions

1. **Fork the repository**
   ```bash
   git clone https://github.com/[your-username]/fritzian-volumetric-indexing.git
   cd fritzian-volumetric-indexing
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   - Run existing test suite
   - Add new tests if needed
   - Verify examples still work

5. **Commit with clear messages**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
   
   Use prefixes:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements
   - `Docs:` for documentation only
   - `Refactor:` for code restructuring

6. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### Python
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Maximum line length: 100 characters

### JavaScript/TypeScript
- Use ES6+ features
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for functions

### General
- Write self-documenting code
- Add comments for complex logic only
- Keep functions small and focused
- Include unit tests

## Testing Requirements

All code contributions should include tests:

### For Parsers
- Valid FVI file parsing
- Invalid format handling
- Edge cases (empty grids, single voxel, etc.)
- Large file handling

### For Generators
- Correct index ordering
- Binary string accuracy
- Various grid sizes
- Round-trip consistency (generate → parse → generate)

### For Converters
- Format validation
- Data integrity
- Metadata preservation
- Error handling

## Documentation Standards

### Code Documentation
- Function/method purpose
- Parameter descriptions
- Return value description
- Example usage
- Complexity analysis (if relevant)

### Example Format
```python
def get_x_plane(x, grid_size, voxel_strings):
    """
    Extract all voxel data for a specific X-plane.
    
    Args:
        x (int): X-coordinate of plane (0 to grid_size-1)
        grid_size (int): Size of cubic grid
        voxel_strings (list): List of binary strings from FVI file
    
    Returns:
        list: Voxel strings forming the X-plane
    
    Complexity:
        O(grid_size) - must collect indices from each Y row
    
    Example:
        >>> strings = load_fvi_file("example.csv")
        >>> plane = get_x_plane(0, 15, strings)
        >>> len(plane)
        15
    """
    # Implementation...
```

## Pull Request Process

1. **Ensure your PR**:
   - Builds successfully
   - Passes all tests
   - Follows code style guidelines
   - Includes documentation updates
   - Has a clear description

2. **PR Description should include**:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Related issues (if applicable)

3. **Review Process**:
   - Maintainers will review your PR
   - Address feedback constructively
   - Make requested changes
   - PR will be merged once approved

4. **After Merge**:
   - Your contribution will be credited
   - Changes will appear in next release
   - CHANGELOG will be updated

## Versioning

FVI follows semantic versioning (SemVer):
- **Major** (1.0.0): Breaking changes to specification
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, clarifications

## Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the project

### Be Collaborative
- Help others in discussions
- Share knowledge freely
- Give credit where due
- Welcome newcomers

### Be Professional
- Keep discussions on-topic
- Avoid personal attacks
- Resolve conflicts constructively
- Follow the Code of Conduct

## Recognition

Contributors will be recognized in:
- CHANGELOG for their specific contributions
- GitHub contributors page
- README acknowledgments section (for significant contributions)

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Create an Issue
- **Security concerns**: Email [your-email] directly
- **Specification questions**: Reference SPECIFICATION.md or ask in Discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License, the same license as the project.

---

Thank you for contributing to Fritzian Volumetric Indexing! Your efforts help make volumetric data encoding more accessible and standardized. 🚀
