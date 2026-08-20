# Post-Release Sync

This document is intended to be executed by a human operator or by the cloud Copilot agent.

## Goal

After the release PR is merged into `master`, merge back to `develop`, bump development versions, and push `develop`.

## Inputs

1. `source_branch`: `master`
2. `target_branch`: `develop`
3. `development_marker`: example `-dev`

## Files to inspect and update

1. Version source files used by the repository
2. README files that mention development versioning
3. Release notes or release metadata that should remain consistent with `develop`

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

### 2. Merge back from `master`

1. Merge `origin/master` into `develop`.
2. Resolve conflicts if any are present.

```sh
git merge origin/master
```

### 3. Bump development versions

1. Increment version numbers on `develop` to the next development version.
2. Restore development markers in files that carry version strings.
3. Keep README wording aligned with the development state.
4. Keep release notes consistent with the post-release branch state.

Suggested checks:

1. Search for the released version and ensure `develop` no longer advertises it as stable.
2. Verify the new development version marker is present where needed.
3. Verify the README and release notes do not describe `develop` as a released tag.

### 4. Commit the sync-back

1. Review the diff.
2. Commit the merge-back and version bump.

```sh
git add .
git commit -m "Bump development version after release"
```

### 5. Push `develop`

1. Push `develop` to origin.

```sh
git push origin develop
```

## Expected outcome

1. `develop` contains the merge-back from `master`.
2. Version numbers are set to the next development value.
3. The branch is pushed to origin.

## Completion checklist

1. `master` was merged back into `develop`.
2. Development versions were bumped.
3. README and release note references are coherent with the dev state.
4. `develop` was committed and pushed.
