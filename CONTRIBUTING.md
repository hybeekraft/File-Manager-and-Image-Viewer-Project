# Contributing to File Manager and Image Viewer

Thanks for contributing! This project is organized around a [GitHub Project board](https://github.com/users/hybeekraft/projects/3) with issues grouped into 6 phases: **Requirements analysis → System Design → Implementation → Testing → Deployment → Maintenance**.

Please follow this workflow so everyone's work stays organized and visible.

## 1. Pick an issue

- Go to the [Project board](https://github.com/users/hybeekraft/projects/3/views/1) or the [Issues tab](https://github.com/hybeekraft/File-Manager-and-Image-Viewer-Project/issues).
- Find an unassigned issue that matches your interest or skill area.
- Open it and click **Assignees** → add yourself.
- If you're not sure what to pick, start with something in **Implementation** or **Testing** — there are many small, independent tasks there.
- Don't see anything that fits? Open a new issue describing what you'd like to work on, and label it with the relevant phase.

## 2. Create a branch

Name your branch after the issue number and a short description:

```bash
git checkout -b feature/12-image-zoom-controls
```

Use `feature/` for new functionality, `fix/` for bug fixes, and `docs/` for documentation-only changes.

## 3. Do the work

- Keep commits focused and write clear commit messages (e.g. `Add zoom in/out controls to image viewer`).
- Make sure your local git email matches your GitHub account email, so your commits are properly attributed:

```bash
git config --global user.email "your-github-email@example.com"
```

## 4. Open a Pull Request

- Push your branch and open a PR against `main`.
- In the PR description, include **`Closes #<issue-number>`** (e.g. `Closes #12`). This automatically links the PR to the issue and closes it when the PR merges.
- Give the PR a clear title and a short summary of what changed and why.
- Request a review from a maintainer or another contributor.

## 5. Respond to review feedback

- Address requested changes with additional commits on the same branch — no need to open a new PR.
- Once approved, a maintainer will merge it. Direct pushes to `main` aren't allowed; everything goes through a reviewed PR.

## Where to see contributions

- **Project board** — shows issue status and who's assigned to what.
- **Repo → Insights → Contributors** — shows commit activity per person over time.
- **Repo → Insights → Pulse** — shows recent merged PRs and closed issues.

## Questions

If you're stuck or unsure which issue to pick, open a [Discussion](https://github.com/hybeekraft/File-Manager-and-Image-Viewer-Project/discussions) or comment directly on an issue — a maintainer will help point you in the right direction.
