// Game Logic Module - handles 2D physics and collision detection
// This module is independent of rendering

export class GameLogic {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        
        // Game state
        this.score = { player1: 0, player2: 0 };
        this.running = false;
        
        // Ball
        this.ball = {
            x: width / 2,
            y: height / 2,
            width: 10,
            height: 10,
            velocityX: 300,
            velocityY: 200,
            speed: 300
        };
        
        // Paddles
        this.paddle1 = {
            x: 20,
            y: height / 2 - 50,
            width: 10,
            height: 100,
            speed: 400,
            velocityY: 0
        };
        
        this.paddle2 = {
            x: width - 30,
            y: height / 2 - 50,
            width: 10,
            height: 100,
            speed: 400,
            velocityY: 0
        };
        
        // Input state
        this.keys = {
            w: false,
            s: false,
            ArrowUp: false,
            ArrowDown: false
        };
        
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'W') this.keys.w = true;
            if (e.key === 's' || e.key === 'S') this.keys.s = true;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.keys.ArrowUp = true;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.keys.ArrowDown = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'w' || e.key === 'W') this.keys.w = false;
            if (e.key === 's' || e.key === 'S') this.keys.s = false;
            if (e.key === 'ArrowUp') this.keys.ArrowUp = false;
            if (e.key === 'ArrowDown') this.keys.ArrowDown = false;
        });
    }
    
    start() {
        this.running = true;
    }
    
    reset() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        
        // Randomize initial direction
        const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to 30 degrees
        const direction = Math.random() < 0.5 ? 1 : -1;
        this.ball.velocityX = Math.cos(angle) * this.ball.speed * direction;
        this.ball.velocityY = Math.sin(angle) * this.ball.speed;
    }
    
    update(deltaTime) {
        if (!this.running) return;
        
        // Update paddle velocities based on input
        this.paddle1.velocityY = 0;
        if (this.keys.w) this.paddle1.velocityY = -this.paddle1.speed;
        if (this.keys.s) this.paddle1.velocityY = this.paddle1.speed;
        
        this.paddle2.velocityY = 0;
        if (this.keys.ArrowUp) this.paddle2.velocityY = -this.paddle2.speed;
        if (this.keys.ArrowDown) this.paddle2.velocityY = this.paddle2.speed;
        
        // Update paddle positions
        this.paddle1.y += this.paddle1.velocityY * deltaTime;
        this.paddle2.y += this.paddle2.velocityY * deltaTime;
        
        // Constrain paddles to game bounds
        this.paddle1.y = Math.max(0, Math.min(this.height - this.paddle1.height, this.paddle1.y));
        this.paddle2.y = Math.max(0, Math.min(this.height - this.paddle2.height, this.paddle2.y));
        
        // Update ball position
        this.ball.x += this.ball.velocityX * deltaTime;
        this.ball.y += this.ball.velocityY * deltaTime;
        
        // Ball collision with top/bottom walls
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.height) {
            this.ball.velocityY = -this.ball.velocityY;
            this.ball.y = Math.max(0, Math.min(this.height - this.ball.height, this.ball.y));
        }
        
        // Check collisions with paddles using SAT
        this.checkPaddleCollision(this.paddle1);
        this.checkPaddleCollision(this.paddle2);
        
        // Ball out of bounds - scoring
        if (this.ball.x <= 0) {
            this.score.player2++;
            this.onScore();
            this.reset();
        } else if (this.ball.x >= this.width) {
            this.score.player1++;
            this.onScore();
            this.reset();
        }
    }
    
    checkPaddleCollision(paddle) {
        // Create SAT boxes for collision detection
        const ballBox = new SAT.Box(
            new SAT.Vector(this.ball.x, this.ball.y),
            this.ball.width,
            this.ball.height
        ).toPolygon();
        
        const paddleBox = new SAT.Box(
            new SAT.Vector(paddle.x, paddle.y),
            paddle.width,
            paddle.height
        ).toPolygon();
        
        const response = new SAT.Response();
        const collided = SAT.testPolygonPolygon(ballBox, paddleBox, response);
        
        if (collided) {
            // Resolve collision
            this.ball.x -= response.overlapV.x;
            this.ball.y -= response.overlapV.y;
            
            // Reverse horizontal velocity and add slight increase
            this.ball.velocityX = -this.ball.velocityX * 1.05;
            
            // Add spin based on where ball hits paddle
            const paddleCenter = paddle.y + paddle.height / 2;
            const ballCenter = this.ball.y + this.ball.height / 2;
            const hitPosition = (ballCenter - paddleCenter) / (paddle.height / 2);
            this.ball.velocityY += hitPosition * 200;
            
            // Limit vertical velocity
            this.ball.velocityY = Math.max(-500, Math.min(500, this.ball.velocityY));
        }
    }
    
    onScore() {
        // Override this method to handle score updates
    }
    
    getState() {
        return {
            ball: { ...this.ball },
            paddle1: { ...this.paddle1 },
            paddle2: { ...this.paddle2 },
            score: { ...this.score },
            width: this.width,
            height: this.height
        };
    }
}
