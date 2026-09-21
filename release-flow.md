# Release Flow

This document is intended to be executed by a human operator or by the cloud Copilot agent.

## Goal

Create a stable release branch from `develop`, normalize versioned files, and open a pull request into `master`.

## Inputs

1. `release_version`: example `v.0.2.1`
2. `release_branch`: example `release/v.0.2.1`
3. `source_branch`: `develop`
4. `target_branch`: `master`

## Files to inspect and update

1. Version source files used by the repository
2. README files that mention the current version or release state
3. Release notes files or release note sections

## Procedure

### 1. Fetch and sync local state

1. Fetch the repository.
2. Checkout `develop`.
3. Pull the latest changes from `develop`.

```sh
git fetch origin
git checkout develop
git pull origin develop
```

### 2. Create the release branch

1. Create the release branch from `develop`.
2. Use the release version in the branch name.

```sh
git checkout -b release/v.0.2.1
```

### 3. Stabilize the release state

1. Set all release-visible versions to the stable release value.
2. Align README text with release wording.
3. Align release notes text with the same version and status.
4. Avoid development suffixes or temporary markers in release-facing files.

Suggested checks:

1. Search for version strings that still mention the development version.
2. Verify release notes mention the new tag consistently.
3. Verify README links and examples do not contradict the stable branch.

### 4. Commit the release branch

1. Review the diff.
2. Commit the version and documentation updates.

```sh
git add .
git commit -m "Prepare release v0.2.1"
```

### 5. Push and open the PR

1. Push the release branch.
2. Open a pull request from the release branch into `master`.

```sh
git push -u origin release/v.0.2.1
```

## Expected outcome

1. A release branch exists on the remote.
2. The branch contains stable-version updates.
3. A PR targeting `master` is open and ready for review.

## Completion checklist

1. Branch name matches the release version.
2. Release files are consistent with the stable version.
3. The branch is pushed to origin.
4. The PR targets `master`.
5. No development-only version markers remain in release-facing files.
