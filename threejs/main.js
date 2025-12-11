import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuration
const RENDER_WIDTH = 1024;
const RENDER_HEIGHT = 576;
const MODEL_PATH = './Characters.glb';

class CharacterShowcase {
    constructor() {
        this.currentAnimationIndex = 0;
        this.animations = [];
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.fps = 0;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            RENDER_WIDTH / RENDER_HEIGHT,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.5, 4);
        this.camera.lookAt(0, 1, 0);
        
        // Create renderer with optimized settings
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
        this.renderer.setPixelRatio(1); // Force 1:1 pixel ratio for performance
        this.renderer.shadowMap.enabled = false; // Enable shadows for better visuals
        
        // Append to container
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
        
        // Add simple directional light
        const light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 10, 5);
        light.castShadow = false;
        this.scene.add(light);
        
        // Add ambient light for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Add ground plane for reference
        // const groundGeometry = new THREE.PlaneGeometry(10, 10);
        // const groundMaterial = new THREE.MeshBasicMaterial({
        //     color: 0x16213e,
        //     side: THREE.DoubleSide
        // });
        // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        // ground.rotation.x = -Math.PI / 2;
        // this.scene.add(ground);
        
        // Load model
        this.loadModel();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
    }
    
    loadModel() {
        const loader = new GLTFLoader();
        
        document.getElementById('animation-name').textContent = 'Loading model...';
        
        loader.load(
            MODEL_PATH,
            (gltf) => {
                this.model = gltf.scene;
                
                // Center and scale model if needed
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Center model
                this.model.position.x = -center.x;
                this.model.position.y = -box.min.y; // Place on ground
                this.model.position.z = -center.z;
                
                // Optimize materials for performance
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = false;
                        child.receiveShadow = false;
                        
                        // Use simpler materials if possible
                        console.log(child.material)
                        if (child.material) {
                            child.material.flatShading = false;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                this.scene.add(this.model);
                
                // Setup animations
                if (gltf.animations && gltf.animations.length > 0) {
                    this.animations = gltf.animations;
                    this.mixer = new THREE.AnimationMixer(this.model);
                    
                    console.log(`Found ${this.animations.length} animations:`, 
                        this.animations.map(a => a.name));
                    
                    this.playNextAnimation();
                } else {
                    document.getElementById('animation-name').textContent = 'No animations found';
                    document.getElementById('animation-info').textContent = 'Model loaded successfully';
                }
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(0);
                document.getElementById('animation-info').textContent = `Loading: ${percent}%`;
            },
            (error) => {
                console.error('Error loading model:', error);
                document.getElementById('animation-name').textContent = 'Error loading model';
                document.getElementById('animation-info').textContent = error.message;
            }
        );
    }
    
    playNextAnimation() {
        if (!this.mixer || this.animations.length === 0) return;
        
        // Stop all current actions
        this.mixer.stopAllAction();
        
        // Reset to T-Pose (first animation) before playing next animation
        if (this.animations.length > 0 && this.currentAnimationIndex !== 0) {
            const tPoseAction = this.mixer.clipAction(this.animations[0]);
            tPoseAction.reset();
            tPoseAction.play();
            tPoseAction.time = 0;
            this.mixer.update(0);
            tPoseAction.stop();
        }
        
        // Get next animation
        const animation = this.animations[this.currentAnimationIndex];
        const action = this.mixer.clipAction(animation);
        
        // Update UI
        document.getElementById('animation-name').textContent = 
            animation.name || `Animation ${this.currentAnimationIndex + 1}`;
        document.getElementById('animation-info').textContent = 
            `${this.currentAnimationIndex + 1} of ${this.animations.length} | Duration: ${animation.duration.toFixed(1)}s`;
        
        // Play animation once
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset();
        action.play();
        
        // Setup event listener for when animation finishes
        const onFinished = (e) => {
            if (e.action === action) {
                this.mixer.removeEventListener('finished', onFinished);
                
                // Wait a moment, then play next animation
                setTimeout(() => {
                    this.currentAnimationIndex = 
                        (this.currentAnimationIndex + 1) % this.animations.length;
                    this.playNextAnimation();
                }, 500);
            }
        };
        
        this.mixer.addEventListener('finished', onFinished);
    }
    
    onWindowResize() {
        // Keep the render resolution fixed but adjust canvas display
        const container = document.getElementById('canvas-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const containerAspect = containerWidth / containerHeight;
        const renderAspect = RENDER_WIDTH / RENDER_HEIGHT;
        
        // Calculate display size maintaining aspect ratio
        let displayWidth, displayHeight;
        if (containerAspect > renderAspect) {
            displayHeight = containerHeight;
            displayWidth = displayHeight * renderAspect;
        } else {
            displayWidth = containerWidth;
            displayHeight = displayWidth / renderAspect;
        }
        
        this.renderer.domElement.style.width = `${displayWidth}px`;
        this.renderer.domElement.style.height = `${displayHeight}px`;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now >= this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`;
        }
        
        // Update animations
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Rotate model slowly for better view
        if (this.model) {
            this.model.rotation.y += delta * 0.2;
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application
new CharacterShowcase();
