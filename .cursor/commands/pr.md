# Create Pull Request

Run this workflow to lint, summarize your changes against `origin/dev`, and open a GitHub PR.

## Steps

1. **Run flake8**
   - First, check if `make test-flake8` exists in the Makefile. If it does, run `make test-flake8` in the project root.
   - If `make test-flake8` doesn't exist, run flake8 directly on the API code: `docker compose exec api flake8 .` or `cd api && flake8 .` (depending on environment).
   - If it fails, list the issues and stop. Ask the user whether to fix them before continuing, or to proceed anyway.

2. **Compare to origin/dev**
   - Ensure `origin/dev` is up to date: `git fetch origin dev`.
   - Get the diff and summary:
     - `git diff origin/dev --stat`
     - `git diff origin/dev` (or a concise summary of changed files and key edits)
   - Optionally: `git log origin/dev..HEAD --oneline` for commit messages.

3. **Generate PR description**
   - From the diff and commits, write a short PR description in Markdown that includes:
     - **Title**: One line summarizing the change (suitable as PR title).
     - **Summary**: 2–4 sentences on what changed and why.
     - **Changes**: Bullet list of main changes (files/areas and what was done).
   - If the user added text after `/pr`, incorporate that as extra context or requirements in the description.

4. **Create the GitHub PR**
   - Push the current branch if needed: `git push -u origin $(git branch --show-current)` (only if there are unpushed commits).
   - Create the PR with the generated description:
     - Use GitHub CLI: `gh pr create --base dev --title "Your title here" --body "Your description here"`.
   - If `gh` is not installed or not logged in, output the title and body so the user can paste them into the GitHub web UI, and give the repo URL and branch name.

## Notes

- Base branch for comparison is **origin/dev** (the main development branch).
- Base branch for the PR is **dev** (on origin).
- Requires [GitHub CLI](https://cli.github.com/) (`gh`) and `gh auth login` for creating the PR from the command line.
- Workflow: Branch from `dev` → Develop → Run `/review-dev` → Run `/pr` → Merge to `dev` → `dev` → `stg` → `master`
