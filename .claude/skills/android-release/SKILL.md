---
name: android-release
description: Prepare a PennySpring Android release commit for the automated GitHub Actions pipeline, including version selection and user-facing release notes.
---

# Android Release

Prepare the version files and release commit that triggers `.github/workflows/android-release.yml` when pushed to `main`.

## Workflow

1. Check the current branch, worktree status, root `version.json`, and existing `vX.Y.Z` tags. Fetch remote tags with `git fetch --tags origin` before listing them so a locally missing tag does not skew the baseline. Stop if `version.json` already has uncommitted user changes; do not overwrite unrelated work.
2. Ask the user which increment strategy to use: major, minor, or patch. Start from the current version in `version.json`, apply that strategy, then keep incrementing the same component until the candidate contains no digit `4` and its `v<candidate>` tag does not already exist. For example, patch `1.2.3` skips `1.2.4` and selects `1.2.5`; major `3.8.2` skips `4.0.0` and selects `5.0.0`. Calculate each candidate with `getNextVersionName` from `scripts/android/version.js`, and write the selected version with `node scripts/android/version.js set <candidate>` so `versionCode` remains consistent.
3. Find the latest semantic-version tag (`vX.Y.Z`). The tag is the release baseline: build the release-note draft from commits after that tag through `HEAD` (`git log <tag>..HEAD`), inspecting commit messages and relevant diffs. Never substitute an `update: vX.Y.Z` release commit for a missing tag. If no version tag exists, explain that the previous release cannot be anchored and ask the user for the baseline before drafting.
4. Exclude commits whose changes are confined to `packages/pennyspring-ui/` or `packages/pennyspring-theme/`. For mixed commits, include only the user-visible app behavior and omit UI/theme library implementation details. Also omit internal refactors, test-only changes, build tooling, and dependency maintenance unless they change behavior PennySpring users notice.
5. Write concise Chinese release notes for users of the PennySpring bookkeeping app. Group items under `新增`, `优化`, or `修复` when useful. Describe outcomes in terms of recording transactions, accounts, budgets, statistics, backups, or other app workflows; do not invent benefits unsupported by the diff. If there are no user-visible changes, say so plainly.
6. Show the chosen version and release-note draft. Once the user accepts the draft, update `version.json` and create a commit limited to that file, with subject `update: v<candidate>` and the accepted notes as its body. Do not push. The workflow uses the commit body as the GitHub Release body; the app reads the Release tag, assets and body through the GitHub Releases API.
7. Verify `version.json` contains the selected version and matching `versionCode`, the version contains no `4`, the tag is unused, and the commit contains only `version.json` with the release notes in its body. Explain that pushing/merging this commit to `main` starts the automated Android build and release.

## Constraints

- Do not include standalone UI or theme library changes in release notes.
- Do not publish, push, delete tags, or modify an existing GitHub Release as part of this workflow.
- If the latest tag cannot be determined or the changes do not support a clear user-facing summary, explain the ambiguity and ask before creating the release commit.
