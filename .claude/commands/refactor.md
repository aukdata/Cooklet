# Refactor the codebase

You are responsible for refactoring the codebase to improve readability, modularity, and separation of concerns.
Avoid superficial adjustments — your changes should aim for structural clarity and long-term maintainability.
After completing the refactoring, run pnpm run build:netlify to confirm successful compilation.
Then, report the summary to the user in Japanese.
Think harder.

Note: The goal is not only to simplify the code, but also to clarify responsibilities and improve extensibility.

## Phase 1: Identify and Refactor Complex Structures

- Make sure to read the documents before proceeding.
- Identify large or deeply nested functions, components, or classes.
- Split them into smaller, focused units with clearly defined responsibilities.
- Extract logic into reusable functions or modules when appropriate.
- Ensure that each unit adheres to the Single Responsibility Principle.

## Phase 2: Improve Naming and Structure

- Rename variables, functions, and types to make their purpose self-evident.
- Group related logic together and reorganize files/modules as needed.
- Remove unused or redundant code.
- Eliminate magic numbers and replace them with named constants.

## Phase 3: Remove duplications

- Run `similarity-ts src` to detect duplications.
- Unify the duplications if needed.
- If modification of the specification to unify is needed, report to the user.

## Phase 4: Confirm Behavior and Build

- Ensure that the refactored code maintains the original behavior.
- Run tests if available, or manually verify expected output.

Finally, run:

```bash
pnpm run build:netlify
The build must complete without errors.
```

Report the summary of your changes to the user in Japanese.
