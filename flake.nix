{
  description = "Image Swiper - A web app to swipe through images";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = {
          default = pkgs.stdenv.mkDerivation {
            pname = "image-swiper";
            version = "1.0.0";

            src = ./.;

            buildInputs = [ pkgs.nodejs ];

            installPhase = ''
              mkdir -p $out/bin
              mkdir -p $out/lib/image-swiper

              # Copy application files
              cp -r public $out/lib/image-swiper/
              cp server.js $out/lib/image-swiper/
              cp package.json $out/lib/image-swiper/

              # Create directories for runtime
              mkdir -p $out/lib/image-swiper/images
              mkdir -p $out/lib/image-swiper/saved
              mkdir -p $out/lib/image-swiper/discarded

              # Create wrapper script
              cat > $out/bin/image-swiper <<EOF
              #!/usr/bin/env bash
              set -e

              # Default data directory
              DATA_DIR="\''${IMAGE_SWIPER_DATA_DIR:-\$HOME/.local/share/image-swiper}"

              # Create data directories if they don't exist
              mkdir -p "\$DATA_DIR/images"
              mkdir -p "\$DATA_DIR/saved"
              mkdir -p "\$DATA_DIR/discarded"

              # Create temporary directory with symlinks
              TEMP_DIR=\$(mktemp -d)
              trap "rm -rf \$TEMP_DIR" EXIT

              # Symlink static files
              ln -s $out/lib/image-swiper/public "\$TEMP_DIR/public"
              ln -s $out/lib/image-swiper/server.js "\$TEMP_DIR/server.js"
              ln -s $out/lib/image-swiper/package.json "\$TEMP_DIR/package.json"

              # Symlink data directories
              ln -s "\$DATA_DIR/images" "\$TEMP_DIR/images"
              ln -s "\$DATA_DIR/saved" "\$TEMP_DIR/saved"
              ln -s "\$DATA_DIR/discarded" "\$TEMP_DIR/discarded"

              # Run the server
              cd "\$TEMP_DIR"
              echo "Starting Image Swiper..."
              echo "Data directory: \$DATA_DIR"
              echo "Add your images to: \$DATA_DIR/images"
              echo ""
              ${pkgs.nodejs}/bin/node server.js
              EOF

              chmod +x $out/bin/image-swiper
            '';

            meta = with pkgs.lib; {
              description = "A web app to swipe through images and save or discard them";
              homepage = "https://github.com/narqcc/Swiper-Vibe";
              license = licenses.mit;
              maintainers = [ ];
              platforms = platforms.all;
            };
          };
        };

        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
          ];

          shellHook = ''
            echo "Image Swiper Development Environment"
            echo "====================================="
            echo "Node version: $(node --version)"
            echo ""
            echo "Quick start:"
            echo "  npm start      - Start the development server"
            echo "  node server.js - Run directly"
            echo ""
            echo "Add your images to the ./images directory"
          '';
        };

        # Apps for easy running
        apps.default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/image-swiper";
        };
      }
    );
}
