# Project Documentation Reader Command

## Purpose
Read all project design documents and specifications to understand the complete codebase structure and constraints.

## Execution Scope

### Core Documentation
1. **Main Project**: `CLAUDE.md` (project basics, constraints, naming conventions)
2. **Design & Specifications**:
   - `.claude/TECH_SPECS.md` - Technical architecture, database design, tech stack
   - `.claude/UI.md` - UI design, layouts, usability guidelines
   - `.claude/SECURITY.md` - Security policies and implementation guidelines
3. **Development & Operations**:
   - `.claude/DEVELOPMENT_LOG.md` - Development history, bug fixes, handover notes
   - `.claude/ELEMENTS.md` - Comprehensive list of types, components, and functions
   - `.claude/CODING.md` - Coding standards and best practices

Do not read other *.md at this time. Read other *.md files when you need.

### Feature-Specific Documentation
- Page modules: `src/pages/{auth,recipes,cost,summary,settings,shopping,meal-plans,stock}/CLAUDE.md`
- Component modules: `src/components/{layout,ui,common,shopping,meal-plans,dialogs,summary}/CLAUDE.md`
- Specialized libraries: `src/lib/{ai,vision}/CLAUDE.md`

## Output Rules
- Do not provide summaries or explanations
- Only output "I have read the documents" upon completion
- Briefly confirm specific constraints or critical requirements if necessary
