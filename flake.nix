{
  inputs.dream2nix.url = "github:nix-community/dream2nix";
  outputs = inp:
    inp.dream2nix.lib.makeFlakeOutputs {
      systems = ["aarch64-darwin"];
      config.projectRoot = ./.;
      source = ./.;
      projects = ./projects.toml;
    };
}
