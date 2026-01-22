{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
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
    mkdir -p $out/lib/image-swiper/favorites

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
mkdir -p "\$DATA_DIR/favorites"

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
ln -s "\$DATA_DIR/favorites" "\$TEMP_DIR/favorites"

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
}
