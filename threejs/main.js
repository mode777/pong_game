// Configuration
const RENDER_WIDTH = 1024;
const RENDER_HEIGHT = 576;
const MODEL_PATH = './characters.glb';

class CharacterShowcase {
    constructor() {
        this.currentAnimationIndex = 0;
        this.animations = [];
        this.animationGroups = [];
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.fps = 0;
        
        this.init();
    }
    
    init() {
        // Get canvas element
        const canvas = document.getElementById('renderCanvas');
        
        // Create engine with high-performance settings
        this.engine = new BABYLON.Engine(canvas, false, {
            antialias: false,              // No AA for better performance
            adaptToDeviceRatio: false,     // Render at device pixel ratio 1
            powerPreference: "low-power",  // Optimize for low-power devices
            preserveDrawingBuffer: false,  // Better performance
            stencil: false,                // Disable stencil buffer if not needed
            depth: true
        });
        
        // Force fixed resolution for consistent performance
        this.engine.setHardwareScalingLevel(1.0);
        
        // Create scene with optimizations
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color3.FromHexString('#1a1a2e');
        
        // Disable auto-clear for potential performance gains
        this.scene.autoClear = false;
        this.scene.autoClearDepthAndStencil = false;
        
        // Create camera
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            0,                    // alpha (horizontal rotation)
            Math.PI / 3,         // beta (vertical rotation)
            4,                   // radius
            new BABYLON.Vector3(0, 1, 0),  // target
            this.scene
        );
        this.camera.attachControl(canvas, false);
        this.camera.lowerRadiusLimit = 2;
        this.camera.upperRadiusLimit = 10;
        
        // Simple lighting for performance
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        light.intensity = 1.5;
        light.groundColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        
        // Additional directional light for better visibility
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        dirLight.intensity = 0.6;
        
        // Load model
        this.loadModel();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        this.onWindowResize();
        
        // Start render loop
        this.engine.runRenderLoop(() => {
            this.animate();
        });
    }
    
    loadModel() {
        document.getElementById('animation-name').textContent = 'Loading model...';
        
        BABYLON.SceneLoader.ImportMesh(
            "",                    // Import all meshes
            "./",                  // Root URL
            "characters.glb",      // Filename
            this.scene,
            (meshes, particleSystems, skeletons, animationGroups) => {
                // Model loaded successfully
                if (meshes.length > 0) {
                    this.model = meshes[0];
                    
                    // Center and position model
                    const boundingInfo = this.model.getHierarchyBoundingVectors();
                    const center = BABYLON.Vector3.Center(boundingInfo.min, boundingInfo.max);
                    const size = boundingInfo.max.subtract(boundingInfo.min);
                    
                    // Center model
                    this.model.position.x = -center.x;
                    this.model.position.y = -boundingInfo.min.y;
                    this.model.position.z = -center.z;
                    
                    // Optimize meshes for performance
                    meshes.forEach((mesh) => {
                        if (mesh.material) {
                            // Freeze materials to avoid shader recompilation
                            mesh.material.freeze();
                            
                            // Disable unnecessary features
                            mesh.material.disableLighting = false; // Keep basic lighting
                        }
                        
                        // Freeze world matrix for static parts
                        // Don't freeze animated meshes
                        if (!mesh.skeleton) {
                            mesh.freezeWorldMatrix();
                        }
                        
                        // Disable unnecessary features
                        mesh.receiveShadows = false;
                    });
                    
                    console.log(`Loaded ${meshes.length} meshes`);
                }
                
                // Setup animations
                if (animationGroups && animationGroups.length > 0) {
                    this.animationGroups = animationGroups;
                    
                    // Stop all animations initially
                    this.animationGroups.forEach(ag => ag.stop());
                    
                    console.log(`Found ${this.animationGroups.length} animations:`, 
                        this.animationGroups.map(ag => ag.name));
                    
                    this.playNextAnimation();
                } else {
                    document.getElementById('animation-name').textContent = 'No animations found';
                    document.getElementById('animation-info').textContent = 'Model loaded successfully';
                }
            },
            (event) => {
                // Progress callback
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total * 100).toFixed(0);
                    document.getElementById('animation-info').textContent = `Loading: ${percent}%`;
                }
            },
            (scene, message, exception) => {
                // Error callback
                console.error('Error loading model:', message, exception);
                document.getElementById('animation-name').textContent = 'Error loading model';
                document.getElementById('animation-info').textContent = message;
            }
        );
    }
    
    playNextAnimation() {
        if (this.animationGroups.length === 0) return;
        
        // Stop all current animations
        this.animationGroups.forEach(ag => ag.stop());
        
        // Get next animation
        const animGroup = this.animationGroups[this.currentAnimationIndex];
        
        // Update UI
        document.getElementById('animation-name').textContent = 
            animGroup.name || `Animation ${this.currentAnimationIndex + 1}`;
        
        const duration = (animGroup.to - animGroup.from) / 60; // Assuming 60 FPS
        document.getElementById('animation-info').textContent = 
            `${this.currentAnimationIndex + 1} of ${this.animationGroups.length} | Duration: ${duration.toFixed(1)}s`;
        
        // Play animation once
        animGroup.reset();
        animGroup.start(false, 1.0, animGroup.from, animGroup.to);
        
        // Setup callback for when animation finishes
        animGroup.onAnimationEndObservable.addOnce(() => {
            // Wait a moment, then play next animation
            setTimeout(() => {
                this.currentAnimationIndex = 
                    (this.currentAnimationIndex + 1) % this.animationGroups.length;
                this.playNextAnimation();
            }, 500);
        });
    }
    
    onWindowResize() {
        // Resize engine to match canvas
        this.engine.resize();
    }
    
    animate() {
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now >= this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`;
        }
        
        // Rotate model slowly for better view
        if (this.model) {
            this.model.rotation.y += this.engine.getDeltaTime() / 1000 * 0.2;
        }
        
        // Render scene
        this.scene.render();
    }
}

// Initialize the application when Babylon.js is loaded
if (typeof BABYLON !== 'undefined') {
    new CharacterShowcase();
} else {
    console.error('Babylon.js not loaded');
}

