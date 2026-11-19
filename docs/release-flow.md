# Release Flow

The canonical release procedure is maintained in the repository root: [release-flow.md](https://github.com/dardino/scacchi-painter/blob/master/release-flow.md).

Summary:

1. Fetch and check out `master`, then pull the latest changes.
2. Create a `release/{version}` branch from `master`.
3. Normalize all release-visible versions, README text, changelog and in-app release notes; keep historical version sections intact.
4. Review the diff, commit and push the branch.
5. Open a pull request from the release branch into `master`.

After the release PR is merged, follow [post-release sync](post-release-sync.md) to merge back and bump development versions.
