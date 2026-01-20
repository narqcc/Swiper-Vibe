const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = 3000;
const IMAGES_DIR = path.join(__dirname, 'images');
const SAVED_DIR = path.join(__dirname, 'saved');
const DISCARDED_DIR = path.join(__dirname, 'discarded');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

async function getImages() {
    try {
        const files = await fs.readdir(IMAGES_DIR);
        // Filter for image files only
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });
        return imageFiles;
    } catch (error) {
        console.error('Error reading images directory:', error);
        return [];
    }
}

async function moveImage(imagePath, direction) {
    const sourcePath = path.join(IMAGES_DIR, imagePath);
    const destDir = direction === 'right' ? SAVED_DIR : DISCARDED_DIR;
    const destPath = path.join(destDir, imagePath);

    try {
        await fs.rename(sourcePath, destPath);
        console.log(`Moved ${imagePath} to ${direction === 'right' ? 'saved' : 'discarded'}`);
        return true;
    } catch (error) {
        console.error('Error moving image:', error);
        return false;
    }
}

async function undoMove(imagePath) {
    // Check both saved and discarded directories
    const savedPath = path.join(SAVED_DIR, imagePath);
    const discardedPath = path.join(DISCARDED_DIR, imagePath);
    const destPath = path.join(IMAGES_DIR, imagePath);

    try {
        // Check if file exists in saved directory
        try {
            await fs.access(savedPath);
            await fs.rename(savedPath, destPath);
            console.log(`Moved ${imagePath} back from saved to images`);
            return true;
        } catch (e) {
            // File not in saved, check discarded
        }

        // Check if file exists in discarded directory
        try {
            await fs.access(discardedPath);
            await fs.rename(discardedPath, destPath);
            console.log(`Moved ${imagePath} back from discarded to images`);
            return true;
        } catch (e) {
            // File not found in either directory
        }

        return false;
    } catch (error) {
        console.error('Error undoing move:', error);
        return false;
    }
}

async function serveFile(filePath, res) {
    try {
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
    }
}

async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API routes
    if (pathname === '/api/images' && req.method === 'GET') {
        const images = await getImages();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ images }));
        return;
    }

    if (pathname === '/api/swipe' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { imagePath, direction } = JSON.parse(body);
                const success = await moveImage(imagePath, direction);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    if (pathname === '/api/undo' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { imagePath } = JSON.parse(body);
                const success = await undoMove(imagePath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    // Serve images
    if (pathname.startsWith('/images/')) {
        const imageName = pathname.substring('/images/'.length);
        const imagePath = path.join(IMAGES_DIR, imageName);
        await serveFile(imagePath, res);
        return;
    }

    // Serve static files from public directory
    if (pathname === '/' || pathname === '/index.html') {
        await serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
        return;
    }

    const filePath = path.join(PUBLIC_DIR, pathname);
    await serveFile(filePath, res);
}

// Create server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║     Image Swiper Server Running      ║
╚══════════════════════════════════════╝

Server is running at: http://localhost:${PORT}

Directories:
- Images:    ${IMAGES_DIR}
- Saved:     ${SAVED_DIR}
- Discarded: ${DISCARDED_DIR}

Instructions:
1. Add images to the 'images' folder
2. Open http://localhost:${PORT} in your browser
3. Swipe right to save, swipe left to discard
4. Saved images go to 'saved' folder
5. Discarded images go to 'discarded' folder

Controls:
- Drag or swipe to move cards
- Click buttons or use arrow keys (← →)
- Press Ctrl+Z to undo last action

Press Ctrl+C to stop the server
    `);
});
