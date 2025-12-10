// Main Game Controller - coordinates game logic and rendering
import { GameLogic } from './gameLogic.js';
import { Renderer } from './renderer.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.hudElement = document.getElementById('hud');
        
        // Initialize game logic (2D)
        this.gameLogic = new GameLogic(800, 600);
        
        // Initialize renderer (3D)
        this.renderer = new Renderer(this.canvas);
        
        // Set up score callback
        this.gameLogic.onScore = () => this.updateHUD();
        
        // Game loop timing
        this.lastTime = performance.now();
        
        // Start the game
        this.gameLogic.start();
        this.gameLoop();
    }
    
    updateHUD() {
        const score = this.gameLogic.score;
        this.hudElement.textContent = `${score.player1} - ${score.player2}`;
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Update game logic (2D physics)
        this.gameLogic.update(deltaTime);
        
        // Get current game state
        const gameState = this.gameLogic.getState();
        
        // Update 3D rendering based on game state
        this.renderer.updateFromGameState(gameState);
        
        // Render the scene
        this.renderer.render();
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
