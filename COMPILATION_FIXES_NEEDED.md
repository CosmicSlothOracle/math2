# TypeScript Compilation Fixes Needed

## Issues Found

1. **Template String Explanations** - Multiple functions in `potenzenQuests.ts` have template strings in scenario definitions that reference variables that don't exist in scope. These need to be converted to functions.

2. **PreTask correctAnswer Type** - Fixed (changed to JSON.stringify with `as any` cast)

## Required Fixes

All explanation `e:` properties in scenario definitions need to be functions that return strings, similar to how `q:` and `a:` are already functions.

Example pattern:
```typescript
// WRONG:
e: `Text with ${variable}`,

// CORRECT:
e: (param: type) => `Text with ${param}`,
```

Then when generating the task, call the function:
```typescript
const explanation = typeof scenario.e === 'function' ? scenario.e(param1, param2) : scenario.e;
```

## Files Affected

- `services/potenzenQuests.ts` - Lines 247, 255, 266, 277 (WurzelLaborQuest scenarios)
- All other explanation functions should already be correct (they're already functions)

## Status

The structure is correct, but TypeScript compilation will fail until these template strings are converted to functions. The code logic is sound.

