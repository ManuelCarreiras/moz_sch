# Compare to origin/dev and Code Review for Bugs

Run this workflow **before** merging to `dev` to compare your branch to `origin/dev` and get a focused code review for possible bugs introduced by your changes.

## Steps

1. **Update and get the diff**
   - Run: `git fetch origin dev`
   - Get the comparison:
     - `git diff origin/dev --stat`
     - `git diff origin/dev` (full diff; if very large, summarize per file and show key hunks)
   - Optionally: `git log origin/dev..HEAD --oneline` for commit context.

2. **Code review for possible bugs**
   - Review **only the changed lines** (additions and modifications) in the diff.
   - For each changed file, check for:
     - **Logic errors**: Wrong conditions, off-by-one, inverted logic, incorrect defaults.
     - **Edge cases**: Empty inputs, null/None, zero-length, missing keys/attributes.
     - **Error handling**: Uncaught exceptions, bare `except`, swallowing errors, missing validation.
     - **Resource/safety**: Unclosed files or connections, missing cleanup in error paths.
     - **Types and nullability**: Possible None dereference, wrong type assumptions, misuse of optional values.
     - **Security**: User input used unsafely, secrets in logs, injection risks.
     - **Consistency**: Divergence from existing patterns in the same file or codebase that could cause subtle bugs.
   - Output a concise **code review** with:
     - **Summary**: One short paragraph on overall risk and main areas of concern.
     - **Findings**: Bullet list of potential bugs or issues, each with file (and line if useful), what's wrong, and a brief suggestion.
     - **Suggestions**: Optional quick wins (tests, assertions, or small refactors) to reduce risk before merging to dev.

3. **No fixes by default**
   - Do not apply code changes unless the user explicitly asks. Only report findings and suggestions.

## Notes

- Base comparison is **origin/dev** (the main development branch).
- This command does not run flake8 or create a PR; it's for pre-merge review.
- If the user added text after the command (e.g. `/review-dev focus on API`), use it to narrow the review (e.g. focus on API or specific paths).
- Workflow: Branch from `dev` → Develop → Run `/review-dev` → Merge to `dev` → `dev` → `stg` → `master`
