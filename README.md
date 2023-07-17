# Red Pen

Red Pen is a [retext](https://github.com/retextjs/retext)-based plugin for the [Obsidian](https://obsidian.md) note-taking app that acts as a proofreader for your writing.

Red pen will highlight phrases that could use simplifying, identify [weasel words](https://en.wikipedia.org/wiki/Weasel_word), [hedges](https://en.wikipedia.org/wiki/Hedge_%28linguistics%29), and [fillers](https://en.wikipedia.org/wiki/Filler_%28linguistics%29), and many more.

## Development

[Install Nix on your system](https://github.com/DeterminateSystems/nix-installer), then run `nix build` to compile the TypeScript.
The resulting `main.js`, `styles.css`, and  `manifest.json` can then be found in the [`./result/lib/node_modules/red-pen`](./result/lib/node_modules/red-pen) directory.

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (`obsidian.d.ts`) in Typescript Definition format, which contains TSDoc comments describing what it does.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/red-pen/`.
