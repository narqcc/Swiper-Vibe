{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
  ];

  shellHook = ''
    echo "Image Swiper Development Environment"
    echo "====================================="
    echo "Node version: $(node --version)"
    echo ""
    echo "Quick start:"
    echo "  npm start    - Start the development server"
    echo "  node server.js - Run directly"
    echo ""
    echo "Add your images to the ./images directory"
  '';
}
