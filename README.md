# pomodoro-timer

Pomodoro timer implementations collected in a single repository, with a simple landing page for GitHub Pages.

## Implementations

- `by-codex`: static HTML, CSS, and JavaScript
- `by-antigravity`: React + TypeScript + Vite

## GitHub Pages URLs

The workflow is configured to publish these paths on GitHub Pages:

- `by-codex`: [https://tienhuynh-tn.github.io/pomodoro-timer/by-codex/](https://tienhuynh-tn.github.io/pomodoro-timer/by-codex/)
- `by-antigravity`: [https://tienhuynh-tn.github.io/pomodoro-timer/by-antigravity/](https://tienhuynh-tn.github.io/pomodoro-timer/by-antigravity/)

The landing page is intended to be available at:

- [https://tienhuynh-tn.github.io/pomodoro-timer/](https://tienhuynh-tn.github.io/pomodoro-timer/)

Note: GitHub Pages is not enabled for the repository yet, so the URLs above will work after Pages is turned on and configured to deploy from GitHub Actions.

## Project Structure

```text
.
|-- .github/
|   `-- workflows/
|       `-- deploy-pages.yml
|-- by-antigravity/
|-- by-codex/
`-- README.md
```

## Run Locally

### by-codex

Open [`by-codex/index.html`](./by-codex/index.html) directly in a browser.

### by-antigravity

```bash
cd by-antigravity
npm install
npm run dev
```

To create a production build:

```bash
cd by-antigravity
npm run build
```

## Deployment

The GitHub Actions workflow in [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) builds the Vite app, copies the static app, and publishes both under the same Pages site.
