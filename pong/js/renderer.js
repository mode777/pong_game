// Renderer Module - handles 3D visualization using Three.js
// This module is independent of game logic

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            1000
        );
        this.camera.position.z = 500;
        this.camera.position.y = 0;
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create game objects
        this.createGameObjects();
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 20);
        this.scene.add(directionalLight);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    createGameObjects() {
        // Ball (sphere)
        const ballGeometry = new THREE.BoxGeometry(10, 10, 10);
        const ballMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            emissive: 0x444444
        });
        this.ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        this.scene.add(this.ballMesh);
        
        // Paddle 1 (left)
        const paddle1Geometry = new THREE.BoxGeometry(10, 100, 20);
        const paddle1Material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x004400
        });
        this.paddle1Mesh = new THREE.Mesh(paddle1Geometry, paddle1Material);
        this.scene.add(this.paddle1Mesh);
        
        // Paddle 2 (right)
        const paddle2Geometry = new THREE.BoxGeometry(10, 100, 20);
        const paddle2Material = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0x440000
        });
        this.paddle2Mesh = new THREE.Mesh(paddle2Geometry, paddle2Material);
        this.scene.add(this.paddle2Mesh);
        
        // Game boundaries (visual reference)
        this.createBoundaries();
        
        // Center line
        this.createCenterLine();
    }
    
    createBoundaries() {
        const boundaryMaterial = new THREE.LineBasicMaterial({ 
            color: 0x444444,
            linewidth: 2
        });
        
        // Top boundary
        const topGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-400, 300, 0),
            new THREE.Vector3(400, 300, 0)
        ]);
        const topLine = new THREE.Line(topGeometry, boundaryMaterial);
        this.scene.add(topLine);
        
        // Bottom boundary
        const bottomGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-400, -300, 0),
            new THREE.Vector3(400, -300, 0)
        ]);
        const bottomLine = new THREE.Line(bottomGeometry, boundaryMaterial);
        this.scene.add(bottomLine);
    }
    
    createCenterLine() {
        const material = new THREE.LineDashedMaterial({
            color: 0x444444,
            linewidth: 1,
            dashSize: 10,
            gapSize: 10
        });
        
        const points = [
            new THREE.Vector3(0, -300, 0),
            new THREE.Vector3(0, 300, 0)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        this.scene.add(line);
    }
    
    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }
    
    // Update 3D positions based on 2D game state
    updateFromGameState(gameState) {
        const { ball, paddle1, paddle2, width, height } = gameState;
        
        // Convert 2D coordinates to 3D (centered origin)
        // Map game coordinates (0,0 top-left) to 3D coordinates (0,0 center)
        
        // Ball position
        this.ballMesh.position.x = ball.x - width / 2;
        this.ballMesh.position.y = -(ball.y - height / 2);
        this.ballMesh.position.z = 0;
        
        // Ball rotation for visual effect
        this.ballMesh.rotation.x += 0.05;
        this.ballMesh.rotation.y += 0.05;
        
        // Paddle 1 position
        this.paddle1Mesh.position.x = paddle1.x - width / 2;
        this.paddle1Mesh.position.y = -(paddle1.y + paddle1.height / 2 - height / 2);
        this.paddle1Mesh.position.z = 0;
        
        // Paddle 2 position
        this.paddle2Mesh.position.x = paddle2.x - width / 2;
        this.paddle2Mesh.position.y = -(paddle2.y + paddle2.height / 2 - height / 2);
        this.paddle2Mesh.position.z = 0;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
