# Fix Notes for potenzenQuests.ts

The template string explanations need to be generated at runtime when variables are in scope, not in the scenario definitions.

Quick fix: Change all explanation `e:` properties from template strings to functions, then call them when generating the task with the actual values.

