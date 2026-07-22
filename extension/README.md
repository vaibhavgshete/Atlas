# Atlas

Atlas gives an AI coding agent persistent memory of your project — so that when its context window fills up or resets, the understanding it built up doesn't disappear with it.

Atlas runs entirely on your machine. No server, no account, no data leaving your workspace.

## Status: Milestone 1 — Memory Core

Right now, Atlas builds a **structural project tree**: your directories, files, and declared dependencies (from `package.json` and `requirements.txt`), stored locally and shown in a sidebar view you can verify against the real project.

Not yet built (planned for later milestones): git history, semantic/embedding-based memory, and exposing this memory directly to an AI agent's context. See `docs/v2/project-vision.md` in the main repo for the full roadmap.

## Requirements

* VS Code
* [Node.js](https://nodejs.org/) (LTS) — only needed to build/run the extension in development; not required once it's packaged

## Running in development

This extension isn't published to the Marketplace yet, so it's run from source via VS Code's Extension Development Host:

1. Open this `extension/` folder in VS Code (as its own workspace root — not the parent repo)
2. `npm install`
3. Press **F5** (or Run and Debug → Run Extension) — opens a second VS Code window with Atlas loaded
4. In that new window, open the project you want Atlas to build memory for

## Usage

* Run **"Atlas: Enable"** from the Command Palette (`Ctrl+Shift+P`) to scan the open project
* Open the **Atlas** icon in the Activity Bar to see the resulting project tree and detected dependencies
* Use the refresh button in that view's title bar to re-scan after making changes

Memory is stored at `.atlas/memory.db` (SQLite) inside the scanned workspace. Add `.atlas/` to that project's `.gitignore` if you don't want it tracked.

## What Atlas does *not* do (by design, for now)

* Modify your project files
* Access the network
* Store file contents or source code — only structure and dependency facts
* Share memory with any AI agent yet — that's a future milestone

## Contributing

For how the code is actually organized (file responsibilities, dependency direction, why `sql.js`), see [`ARCHITECTURE.md`](ARCHITECTURE.md).
