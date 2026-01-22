class ImageSwiper {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.savedCount = 0;
        this.discardedCount = 0;
        this.favoritesCount = 0;
        this.history = [];

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;

        this.cardStack = document.getElementById('cardStack');
        this.loading = document.getElementById('loading');
        this.noImages = document.getElementById('noImages');
        this.swipeHint = document.getElementById('swipeHint');

        this.init();
    }

    async init() {
        await this.loadImages();
        this.setupEventListeners();
        this.renderCards();
        this.updateStats();
    }

    async loadImages() {
        try {
            const response = await fetch('/api/images');
            const data = await response.json();
            this.images = data.images;
            this.loading.style.display = 'none';

            if (this.images.length === 0) {
                this.noImages.style.display = 'block';
                this.swipeHint.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading images:', error);
            this.loading.textContent = 'Error loading images';
        }
    }

    renderCards() {
        this.cardStack.innerHTML = '';

        // Render next 3 cards for stack effect
        const cardsToShow = Math.min(3, this.images.length - this.currentIndex);

        for (let i = cardsToShow - 1; i >= 0; i--) {
            const index = this.currentIndex + i;
            if (index < this.images.length) {
                const card = this.createCard(this.images[index], i);
                this.cardStack.appendChild(card);
            }
        }
    }

    createCard(imagePath, stackIndex) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.image = imagePath;

        // Stack effect: scale and translate cards behind
        if (stackIndex > 0) {
            const scale = 1 - (stackIndex * 0.05);
            const translateY = stackIndex * 10;
            card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            card.style.zIndex = 10 - stackIndex;
            card.style.opacity = 1 - (stackIndex * 0.2);
        } else {
            card.style.zIndex = 10;
        }

        const img = document.createElement('img');
        img.src = `/images/${imagePath}`;
        img.alt = 'Swipe image';

        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';

        card.appendChild(img);
        card.appendChild(overlay);

        // Only add drag listeners to the top card
        if (stackIndex === 0) {
            this.addDragListeners(card);
        }

        return card;
    }

    addDragListeners(card) {
        // Mouse events
        card.addEventListener('mousedown', (e) => this.onDragStart(e, card));
        document.addEventListener('mousemove', (e) => this.onDragMove(e, card));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e, card));

        // Touch events
        card.addEventListener('touchstart', (e) => this.onDragStart(e, card), { passive: false });
        document.addEventListener('touchmove', (e) => this.onDragMove(e, card), { passive: false });
        document.addEventListener('touchend', (e) => this.onDragEnd(e, card));
    }

    onDragStart(e, card) {
        if (e.type === 'mousedown' && e.button !== 0) return;

        this.isDragging = true;
        card.classList.add('dragging');

        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        this.startX = touch.clientX;
        this.startY = touch.clientY;

        e.preventDefault();
    }

    onDragMove(e, card) {
        if (!this.isDragging) return;

        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        this.currentX = touch.clientX - this.startX;
        this.currentY = touch.clientY - this.startY;

        const rotation = this.currentX / 20;
        card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotation}deg)`;

        // Show overlay based on swipe direction
        const overlay = card.querySelector('.card-overlay');
        overlay.className = 'card-overlay';

        // Check for upward swipe (favorite)
        if (this.currentY < -50 && Math.abs(this.currentX) < Math.abs(this.currentY)) {
            overlay.classList.add('favorite');
            overlay.textContent = 'FAVORITE';
        } else if (Math.abs(this.currentX) > 50) {
            if (this.currentX > 0) {
                overlay.classList.add('save');
                overlay.textContent = 'SAVE';
            } else {
                overlay.classList.add('discard');
                overlay.textContent = 'DISCARD';
            }
        }

        e.preventDefault();
    }

    onDragEnd(e, card) {
        if (!this.isDragging) return;

        this.isDragging = false;
        card.classList.remove('dragging');

        const threshold = 100;

        // Check for upward swipe (favorite)
        if (this.currentY < -threshold && Math.abs(this.currentX) < Math.abs(this.currentY)) {
            this.favoriteCard(card);
        } else if (Math.abs(this.currentX) > threshold) {
            if (this.currentX > 0) {
                this.swipeCard(card, 'right');
            } else {
                this.swipeCard(card, 'left');
            }
        } else {
            // Reset card position
            card.style.transform = '';
            const overlay = card.querySelector('.card-overlay');
            overlay.className = 'card-overlay';
        }

        this.currentX = 0;
        this.currentY = 0;
    }

    async swipeCard(card, direction) {
        const imagePath = card.dataset.image;

        // Add animation class
        card.classList.add(`swipe-${direction}`);

        // Save to history for undo
        this.history.push({
            imagePath,
            direction,
            index: this.currentIndex
        });

        // Send to server
        await this.saveDecision(imagePath, direction);

        // Update counts
        if (direction === 'right') {
            this.savedCount++;
        } else {
            this.discardedCount++;
        }

        this.currentIndex++;
        this.updateStats();

        // Wait for animation to complete
        setTimeout(() => {
            card.remove();
            this.renderCards();

            if (this.currentIndex >= this.images.length) {
                this.noImages.style.display = 'block';
                this.swipeHint.style.display = 'none';
            }
        }, 500);
    }

    async favoriteCard(card) {
        const imagePath = card.dataset.image;

        // Add animation class
        card.classList.add('swipe-up');

        // Send to server to copy to favorites
        await this.saveFavorite(imagePath);

        // Update count
        this.favoritesCount++;
        this.updateStats();

        // Reset card position after animation
        setTimeout(() => {
            card.classList.remove('swipe-up');
            card.style.transform = '';
            const overlay = card.querySelector('.card-overlay');
            overlay.className = 'card-overlay';
        }, 500);
    }

    async saveFavorite(imagePath) {
        try {
            await fetch('/api/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imagePath })
            });
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    }

    async saveDecision(imagePath, direction) {
        try {
            await fetch('/api/swipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imagePath, direction })
            });
        } catch (error) {
            console.error('Error saving decision:', error);
        }
    }

    async undo() {
        if (this.history.length === 0) return;

        const lastAction = this.history.pop();

        // Restore counts
        if (lastAction.direction === 'right') {
            this.savedCount--;
        } else {
            this.discardedCount--;
        }

        // Move image back to original folder
        await fetch('/api/undo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imagePath: lastAction.imagePath })
        });

        // Go back one image
        this.currentIndex = lastAction.index;
        this.renderCards();
        this.updateStats();
        this.noImages.style.display = 'none';
        this.swipeHint.style.display = 'flex';
    }

    updateStats() {
        document.getElementById('savedCount').textContent = this.savedCount;
        document.getElementById('discardedCount').textContent = this.discardedCount;
        document.getElementById('favoritesCount').textContent = this.favoritesCount;
        document.getElementById('remainingCount').textContent =
            Math.max(0, this.images.length - this.currentIndex);
    }

    setupEventListeners() {
        // Button controls
        document.getElementById('saveBtn').addEventListener('click', () => {
            const topCard = this.cardStack.querySelector('.card');
            if (topCard) this.swipeCard(topCard, 'right');
        });

        document.getElementById('discardBtn').addEventListener('click', () => {
            const topCard = this.cardStack.querySelector('.card');
            if (topCard) this.swipeCard(topCard, 'left');
        });

        document.getElementById('favoriteBtn').addEventListener('click', () => {
            const topCard = this.cardStack.querySelector('.card');
            if (topCard) this.favoriteCard(topCard);
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                const topCard = this.cardStack.querySelector('.card');
                if (topCard) this.swipeCard(topCard, 'right');
            } else if (e.key === 'ArrowLeft') {
                const topCard = this.cardStack.querySelector('.card');
                if (topCard) this.swipeCard(topCard, 'left');
            } else if (e.key === 'ArrowUp') {
                const topCard = this.cardStack.querySelector('.card');
                if (topCard) this.favoriteCard(topCard);
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                this.undo();
            }
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ImageSwiper();
});
