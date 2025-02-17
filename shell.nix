{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "ambisis-sync-service";

  packages = [
    pkgs.nodejs-18_x
    pkgs.python3
  ];

  shellHook = ''
    npm run dev:local
  '';
}