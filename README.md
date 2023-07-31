<h1 align="center">Red Pen</h1>

Red Pen acts as a proofreader for your writing. It highlights phrases that could use simplifying, identifies [weasel words](https://en.wikipedia.org/wiki/Weasel_word), [hedges](https://en.wikipedia.org/wiki/Hedge_%28linguistics%29), [filler](https://en.wikipedia.org/wiki/Filler_%28linguistics%29), and many more.

![Red Pen](./docs/redpenlogo.png)

Red Pen is implemented as a [retext](https://github.com/retextjs/retext)-based plugin for the [Obsidian](https://obsidian.md) note-taking app.

[![built with nix](https://builtwithnix.org/badge.svg)](https://builtwithnix.org)

## Development

This project uses TypeScript to provide type checking and documentation.
The repo depends on the latest plugin API (`obsidian.d.ts`) in TypeScript Definition format, which contains TSDoc comments describing what it does.

### NodeJS instructions

[Install NodeJS](https://nodejs.org/en).

Navigate to the plugin directory.

```bash
cd red-pen
```

Install the project dependencies.

```bash
npm install
```

Compile the source code. The following command keeps running in the terminal and rebuilds the plugin when you modify the source code.

```bash
npm run dev
```

### Nix instructions

[Install Nix](https://github.com/DeterminateSystems/nix-installer) as well as [`direnv`](https://direnv.net/).

Navigate to the plugin directory.

```bash
cd red-pen
```

Run `nix build` to compile the plugin.

The resulting `main.js`, `styles.css`, and `manifest.json` can then be found in the [`./result/lib/node_modules/red-pen`](./result/lib/node_modules/red-pen) directory.

## Manually installing the plugin

Copy over `main.js`, `styles.css`, `manifest.json` to your Obsidian Vault `<VaultFolder>/.obsidian/plugins/red-pen/`.
