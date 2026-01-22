# Image Swiper

A beautiful, responsive web application that allows you to swipe through images and organize them by saving or discarding them. Built with vanilla JavaScript, HTML, and CSS - no frameworks required!

## Features

- **Intuitive Swipe Interface**: Swipe right to save, left to discard, up to favorite
- **Favorites System**: Copy images to a favorites folder without moving them
- **Multiple Input Methods**:
  - Touch gestures (mobile)
  - Mouse drag (desktop)
  - Button clicks
  - Keyboard arrows (← → ↑)
- **Undo Functionality**: Made a mistake? Press Ctrl+Z or click the undo button
- **Visual Feedback**: See real-time overlays as you swipe
- **Statistics Tracking**: Keep track of saved, discarded, favorited, and remaining images
- **Card Stack Effect**: Beautiful card stacking animation
- **Responsive Design**: Works perfectly on mobile and desktop
- **Smooth Animations**: Fluid transitions and effects

## Project Structure

```
Swiper-Vibe/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # All styling and animations
│   └── app.js          # Vanilla JavaScript for swipe logic
├── images/             # Put your images here
├── saved/              # Saved images will be moved here
├── discarded/          # Discarded images will be moved here
├── favorites/          # Favorite images will be copied here
├── server.js           # Node.js server
├── package.json        # Project configuration
├── default.nix         # Nix package definition
├── shell.nix           # Nix development shell
├── flake.nix           # Nix flake for modern Nix
└── README.md           # This file
```

## Installation

### Option 1: Using Nix (Recommended)

If you have Nix installed, you can use this package directly without any other dependencies!

#### Using Nix Flakes (Modern):

```bash
# Run directly without installing
nix run github:narqcc/Swiper-Vibe/claude/image-swipe-app-7MzvN

# Or install to your profile
nix profile install github:narqcc/Swiper-Vibe/claude/image-swipe-app-7MzvN

# Then run
image-swiper
```

#### Using traditional Nix:

```bash
# Build the package
nix-build

# Run the result
./result/bin/image-swiper
```

#### Development with Nix:

```bash
# Enter development shell (with Nix Flakes)
nix develop

# Or with traditional Nix
nix-shell

# Then run the server
npm start
```

**Data Directory**: When using the Nix package, your images are stored in `~/.local/share/image-swiper/`. You can customize this by setting the `IMAGE_SWIPER_DATA_DIR` environment variable:

```bash
IMAGE_SWIPER_DATA_DIR=/path/to/your/images image-swiper
```

### Option 2: Traditional Node.js

1. **Prerequisites**: Make sure you have Node.js installed (version 12 or higher)

2. **Clone or download this repository**

3. **No dependencies to install!** This project uses only Node.js built-in modules.

## Usage

1. **Add your images** to the `images` folder. Supported formats:
   - JPG/JPEG
   - PNG
   - GIF
   - WebP
   - SVG

2. **Start the server**:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

4. **Start swiping!**
   - **Swipe/Drag Right**: Save the image (moves to `saved` folder)
   - **Swipe/Drag Left**: Discard the image (moves to `discarded` folder)
   - **Swipe/Drag Up**: Favorite the image (copies to `favorites` folder, stays in `images`)
   - **Click Buttons**: Use the ✓, ✗, and ★ buttons
   - **Keyboard**: Press → to save, ← to discard, ↑ to favorite
   - **Undo**: Press Ctrl+Z or click the undo button

## How It Works

### Frontend (Vanilla JavaScript)
- **No frameworks or libraries** - pure JavaScript
- Touch and mouse event handling for drag detection
- Smooth CSS animations for card movements
- Real-time visual feedback with overlays
- Keyboard event listeners for arrow keys

### Backend (Node.js)
- Simple HTTP server using built-in modules
- REST API endpoints for:
  - Getting list of images
  - Moving images to saved/discarded folders
  - Copying images to favorites folder
  - Undo functionality
- Serves static files and images

### Image Management
- Images start in the `images` folder
- Swiping right moves them to `saved`
- Swiping left moves them to `discarded`
- Swiping up copies them to `favorites` (image stays in place)
- Undo moves them back to `images`

## Customization

### Change the Port
Edit `server.js` and modify the `PORT` constant:
```javascript
const PORT = 3000; // Change to your desired port
```

### Modify Swipe Threshold
Edit `app.js` and adjust the threshold value:
```javascript
const threshold = 100; // Pixels needed to trigger swipe (default: 100)
```

### Customize Colors
Edit `styles.css` to change the color scheme:
```css
/* Main gradient background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Save color (green) */
color: #4caf50;

/* Discard color (red) */
color: #f44336;

/* Favorite color (yellow/gold) */
color: #ffc107;
```

## Browser Compatibility

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Full support with touch gestures

## Tips

- **Performance**: The app loads only 3 cards at a time for smooth performance
- **Undo**: You can undo multiple actions in sequence
- **Favorites**: Favoriting copies the image without removing it, so you can save/discard it later
- **Keyboard Shortcuts**:
  - `→` Save current image
  - `←` Discard current image
  - `↑` Favorite current image
  - `Ctrl+Z` Undo last action
- **Mobile**: Swipe gestures work naturally on touch devices

## Troubleshooting

**No images showing?**
- Make sure you have image files in the `images` folder
- Check that the file extensions are supported (.jpg, .png, .gif, .webp, .svg)
- Refresh the page

**Server won't start?**
- Check if port 3000 is already in use
- Make sure Node.js is installed (`node --version`)

**Images not moving to folders?**
- Check folder permissions
- Make sure the `saved` and `discarded` folders exist

## License

MIT License - Feel free to use this project for personal or commercial purposes!

## Contributing

Feel free to fork, modify, and improve this project. Pull requests are welcome!
