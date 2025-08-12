# Document Organization Command

This command provides step-by-step instructions for organizing and maintaining the documentation structure of the Cooklet project.

## Overview

The Cooklet project uses a comprehensive documentation system with:
- Main specification in `CLAUDE.md`
- Detailed specifications in `.claude/*.md` files
- Per-directory documentation in `CLAUDE.md` files within each source directory
- Component and utility documentation

## Command: /doc-update

### Phase 1: Assessment and Cleanup

#### Step 1: Review Current Documentation Structure
1. **Identify all documentation files:**
   ```bash
   find . -name "CLAUDE.md" -o -name "*.md" | grep -E '\.(claude|src)' | sort
   ```

2. **Check for duplicate content:**
   - Compare content between `CLAUDE.md` and `.claude/*.md` files
   - Look for redundant information across different files
   - Identify outdated or conflicting specifications

3. **Assess directory-level documentation:**
   - Verify each `src/` subdirectory has appropriate `CLAUDE.md`
   - Check if component documentation matches actual implementation
   - Identify missing documentation for new components/utilities

#### Step 2: Remove Obsolete Documentation
1. **Delete unused files:**
   - Remove `.claude/*.md` files that no longer serve a purpose
   - Delete directory `CLAUDE.md` files for removed components
   - Clean up any temporary or draft documentation files

2. **Remove outdated content:**
   - Delete sections that reference removed features
   - Remove deprecated API documentation
   - Clean up old implementation notes that are no longer relevant

### Phase 2: Content Reorganization

#### Step 3: Consolidate Core Specifications
1. **Update main `CLAUDE.md`:**
   - Keep only high-level project overview
   - Reference detailed specs in `.claude/` directory
   - Ensure consistency with actual implementation
   - Update constraints and development rules

2. **Organize `.claude/` directory:**
   - **Keep essential files:**
     - `TECH_SPECS.md` - Technical architecture and database design
     - `UI.md` - UI/UX design guidelines and component standards
     - `ELEMENTS.md` - Comprehensive component and type reference
     - `DEVELOPMENT_LOG.md` - Development history and lessons learned
     - `CODING.md` - Coding standards and best practices
   
   - **Remove or merge redundant files:**
     - Delete duplicate technical specifications
     - Merge overlapping UI guidelines
     - Consolidate development notes

#### Step 4: Restructure Directory Documentation
1. **Standardize `src/` directory documentation:**
   ```
   src/
   ├── components/
   │   ├── common/CLAUDE.md          # Common components reference
   │   ├── dialogs/CLAUDE.md         # Dialog components reference
   │   ├── ui/CLAUDE.md              # UI components reference
   │   └── [feature]/CLAUDE.md       # Feature-specific components
   ├── hooks/CLAUDE.md               # Custom hooks reference
   ├── utils/CLAUDE.md               # Utility functions reference
   ├── services/CLAUDE.md            # Service layer reference
   └── constants/CLAUDE.md           # Constants and types reference
   ```

2. **Each directory `CLAUDE.md` should contain:**
   - Brief overview of the directory's purpose
   - List of components/functions with descriptions
   - Usage examples for complex components
   - Props/parameters documentation
   - Related dependencies and imports

### Phase 3: Content Standards and Templates

#### Step 5: Establish Documentation Templates

1. **Component Documentation Template:**
   ```markdown
   # [Directory Name] Components

   ## Overview
   Brief description of the directory's purpose and scope.

   ## Components

   ### ComponentName
   - **Purpose:** What this component does
   - **Props:** List of props with types and descriptions
   - **Usage:** Basic usage example
   - **Dependencies:** Required imports and hooks

   ## Related Files
   - Link to related documentation
   - Reference to type definitions
   ```

2. **Utility Documentation Template:**
   ```markdown
   # [Directory Name] Utilities

   ## Overview
   Brief description of utility functions in this directory.

   ## Functions

   ### functionName(params): ReturnType
   - **Purpose:** What this function does
   - **Parameters:** Parameter descriptions with types
   - **Returns:** Return value description
   - **Usage:** Code example
   - **Notes:** Important implementation details
   ```

#### Step 6: Update Documentation Content

1. **Ensure accuracy:**
   - Verify all documented components exist in codebase
   - Check that prop types match TypeScript interfaces
   - Validate usage examples are correct
   - Confirm import paths are accurate

2. **Add missing documentation:**
   - Document newly added components
   - Add missing utility functions
   - Include recent hooks and services
   - Document any new types or interfaces

3. **Improve clarity:**
   - Use consistent terminology throughout
   - Add Japanese translations for user-facing terms
   - Include practical usage examples
   - Link related documentation sections

### Phase 4: Quality Assurance

#### Step 7: Cross-Reference Validation

1. **Verify consistency across files:**
   - Check that component names match between files
   - Ensure type definitions are consistent
   - Validate import paths and dependencies
   - Confirm UI guidelines match actual implementation

2. **Test documentation examples:**
   - Verify code examples compile without errors
   - Check that usage examples work as described
   - Ensure import statements are correct
   - Test any provided command-line examples

#### Step 8: Final Organization

1. **Optimize file structure:**
   - Keep frequently referenced content easily accessible
   - Place detailed implementation notes in appropriate files
   - Ensure logical hierarchy of information
   - Remove any remaining redundancy

2. **Update references:**
   - Fix any broken internal links
   - Update file references in main `CLAUDE.md`
   - Ensure `.claude/ELEMENTS.md` has comprehensive listings
   - Verify all documentation is properly indexed

### Phase 5: Maintenance Guidelines

#### Step 9: Establish Update Procedures

1. **When adding new components:**
   - Add to appropriate directory `CLAUDE.md`
   - Update `.claude/ELEMENTS.md` reference list
   - Include in main specification if architecturally significant
   - Document any new patterns or conventions

2. **When modifying existing components:**
   - Update component documentation immediately
   - Modify usage examples if props change
   - Update type definitions in documentation
   - Note breaking changes in development log

3. **When removing components:**
   - Remove from all documentation files
   - Update any references or examples that used the component
   - Note removal in development log
   - Clean up related documentation sections

#### Step 10: Validation Checklist

**Before completing documentation update:**

- [ ] All `src/` directories have appropriate `CLAUDE.md` files
- [ ] No duplicate information exists across files
- [ ] All documented components exist in codebase
- [ ] Code examples are tested and functional
- [ ] Links between documentation files work correctly
- [ ] `.claude/ELEMENTS.md` is comprehensive and up-to-date
- [ ] Main `CLAUDE.md` accurately reflects current project state
- [ ] Development log includes recent significant changes
- [ ] Coding standards document reflects current practices
- [ ] UI guidelines match actual component implementations

## Usage Instructions

1. **Run this command when:**
   - Significant new features are added
   - Major refactoring is completed
   - Documentation becomes inconsistent with code
   - New team members need comprehensive documentation

2. **Frequency:**
   - After major development sessions
   - Before important releases
   - When documentation drift is noticed
   - Monthly maintenance review

3. **Follow-up actions:**
   - Commit documentation changes with descriptive messages
   - Notify team of documentation updates
   - Update any external documentation references
   - Consider generating documentation summaries for stakeholders

This systematic approach ensures that Cooklet's documentation remains accurate, comprehensive, and useful for both current development and future maintenance.
