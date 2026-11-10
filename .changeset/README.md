# Changesets

Run `pnpm changeset` to describe a change. On merge to `main`, the release workflow opens a
"chore: release" PR; merging that PR bumps the version, updates `CHANGELOG.md`, tags `vX.Y.Z`
and publishes the Docker image for that version.
