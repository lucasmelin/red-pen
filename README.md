# Obsidian Retext

This is a [Retext](https://github.com/retextjs/retext) plugin for [Obsidian](https://obsidian.md).

## Development

[Install Nix on your system](https://github.com/DeterminateSystems/nix-installer), then run `nix build` to compile the TypeScript.
The resulting `main.js`, `styles.css`, and  `manifest.json` can then be found in the [`./result/lib/node_modules/obsidian-retext`](./result/lib/node_modules/obsidian-retext) directory.

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (`obsidian.d.ts`) in Typescript Definition format, which contains TSDoc comments describing what it does.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-retext/`.
