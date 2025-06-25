# Lint the codebase

You are responsible for improving the codebase by eliminating inconsistencies and consolidating duplicated logic to enhance code quality and maintainability.
After this fix, run `pnpm run build:netlify` to confirm successful compilation.
Then, report the summary to the user in  Japanese.

Note: The objective is to ensure a clean, maintainable, and consistent codebase through deliberate and sustainable improvements.

## Step 1: Detect and Merge Duplicate Code

Run the following command to identify duplicated code:

```bash
similarity-ts src
```

- Review the output carefully.
- **MANDATORY** Merge all duplicated code segments.
- When refactoring types, use utilities such as `Partial` and `Omit` to simplify and unify type definitions.
- **MANDATORY** Do not apply temporary or superficial fixes — implement thorough, long-term solutions.

## Step 2: Fix All Linting Errors

Run the following command to check for code style issues:

```bash
pnpm run lint
```

- **MANDATORY** All reported issues must be resolved.
- The project cannot be built until all linting issues are fixed.
