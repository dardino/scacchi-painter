# Release Flow

This document is intended to be executed by a human operator or by the cloud Copilot agent.

## Goal

Create a stable release branch from `develop`, normalize versioned files,
and open a pull request into `master`.

## Inputs

1. `version`: example `0.4.0`
2. `release_version`: set to `v{version}` (es: v0.4.0)
3. `release_branch`: set to `release/{release_version}` from `master` (es: release/v0.4.0)
4. `target_branch`: default `master`

## Files to inspect and update

1. Version source files used by the repository
2. README files that mention the current version or release state
3. Release notes files or release note sections

## Procedure

### 1. Fetch and sync local state

1. Fetch the repository.
2. Checkout `{target_branch}`.
3. Pull the latest changes from `{target_branch}`.

```sh
git fetch origin
git checkout {target_branch}
git pull origin {target_branch}
```

### 2. Create the release branch

1. Create the release branch from `{target_branch}`.
2. Use the release version in the branch name.

```sh
git checkout -b {release_branch}
```

### 3. Stabilize the release state

1. Set all release-visible versions to the stable release value.
2. Align README text with release wording.
3. Align release notes text with the same version and status replacing "wip" and or "future" title with {release_version}
4. Don't change older version comment in release_notes
5. Avoid development suffixes or temporary markers in release-facing files.

```sh
node scripts/update-versions.mjs {version}
```

Suggested checks:

1. Search for version strings that still mention the development version.
2. Verify release notes mention the new tag consistently.
3. Verify README links and examples do not contradict the stable branch.

### 4. Commit the release branch

1. Review the diff.
2. Commit the version and documentation updates.

```sh
git add .
git commit -m "Prepare release {release_version}"
```

### 5. Push and open the PR

1. Push the release branch.
2. Open a pull request from the release branch into `{target_branch}`.

```sh
git push -u origin {release_branch}
```

## Expected outcome

1. A release branch exists on the remote.
2. The branch contains stable-version updates.
3. A PR targeting `{target_branch}` is open and ready for review.

## Completion checklist

1. Branch name matches the release version.
2. Release files are consistent with the stable version.
3. The branch is pushed to origin.
4. The PR targets `{target_branch}`.
5. No development-only version markers remain in release-facing files.
