import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

class CharacterShowcase {
    private currentAnimationIndex: number = 0;
    private animationGroups: BABYLON.AnimationGroup[] = [];
    private frameCount: number = 0;
    private lastFpsUpdate: number = performance.now();
    private fps: number = 0;
    private engine!: BABYLON.Engine;
    private scene!: BABYLON.Scene;
    private camera!: BABYLON.ArcRotateCamera;
    private model?: BABYLON.AbstractMesh;
    
    constructor() {
        this.init();
    }
    
    private init(): void {
        // Get canvas element
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
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
        this.scene.clearColor = BABYLON.Color4.FromHexString('#1a1a2e');
        
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
    
    private loadModel(): void {
        const animationNameEl = document.getElementById('animation-name');
        if (animationNameEl) {
            animationNameEl.textContent = 'Loading model...';
        }
        
        BABYLON.SceneLoader.ImportMesh(
            "",                    // Import all meshes
            "./assets/",           // Root URL
            "Characters.glb",      // Filename
            this.scene,
            (meshes, _particleSystems, _skeletons, animationGroups) => {
                // Model loaded successfully
                if (meshes.length > 0) {
                    this.model = meshes[0];
                    
                    // Center and position model
                    const boundingInfo = this.model.getHierarchyBoundingVectors();
                    const center = BABYLON.Vector3.Center(boundingInfo.min, boundingInfo.max);
                    
                    // Center model
                    this.model.position.x = -center.x;
                    this.model.position.y = -boundingInfo.min.y;
                    this.model.position.z = -center.z;
                    
                    // Optimize meshes for performance
                    meshes.forEach((mesh) => {
                        console.log(mesh.name);
                        if (mesh.material) {
                            // Freeze materials to avoid shader recompilation
                            mesh.material.freeze();
                        }
                        
                        // Disable unnecessary features
                        mesh.receiveShadows = false;

                        // Move mesh to random position in 10m radius
                        if (mesh.name !== "__root__") {
                            mesh.position.x += (Math.random() - 0.5) * 10;
                            mesh.position.z += (Math.random() - 0.5) * 10;
                        }
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
                    const animationNameEl = document.getElementById('animation-name');
                    const animationInfoEl = document.getElementById('animation-info');
                    if (animationNameEl) {
                        animationNameEl.textContent = 'No animations found';
                    }
                    if (animationInfoEl) {
                        animationInfoEl.textContent = 'Model loaded successfully';
                    }
                }
            },
            (event) => {
                // Progress callback
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total * 100).toFixed(0);
                    const animationInfoEl = document.getElementById('animation-info');
                    if (animationInfoEl) {
                        animationInfoEl.textContent = `Loading: ${percent}%`;
                    }
                }
            },
            (_scene, message, exception) => {
                // Error callback
                console.error('Error loading model:', message, exception);
                const animationNameEl = document.getElementById('animation-name');
                const animationInfoEl = document.getElementById('animation-info');
                if (animationNameEl) {
                    animationNameEl.textContent = 'Error loading model';
                }
                if (animationInfoEl) {
                    animationInfoEl.textContent = message || 'Unknown error';
                }
            }
        );
    }
    
    private playNextAnimation(): void {
        if (this.animationGroups.length === 0) return;
        
        // Stop all current animations
        this.animationGroups.forEach(ag => ag.stop());
        
        // Get next animation
        const animGroup = this.animationGroups[this.currentAnimationIndex];
        
        // Update UI
        const animationNameEl = document.getElementById('animation-name');
        if (animationNameEl) {
            animationNameEl.textContent = 
                animGroup.name || `Animation ${this.currentAnimationIndex + 1}`;
        }
        
        const duration = (animGroup.to - animGroup.from) / 60; // Assuming 60 FPS
        const animationInfoEl = document.getElementById('animation-info');
        if (animationInfoEl) {
            animationInfoEl.textContent = 
                `${this.currentAnimationIndex + 1} of ${this.animationGroups.length} | Duration: ${duration.toFixed(1)}s`;
        }
        
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
    
    private onWindowResize(): void {
        // Resize engine to match canvas
        this.engine.resize();
    }
    
    private animate(): void {
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now >= this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            const fpsCounterEl = document.getElementById('fps-counter');
            if (fpsCounterEl) {
                fpsCounterEl.textContent = `FPS: ${this.fps}`;
            }
        }
        
        // Rotate camera around model
        const radius = 8;
        const speed = 0.0005; // Radians per millisecond
        const angle = now * speed;
        this.camera.alpha = angle;
        this.camera.radius = radius;
        
        // Render scene
        this.scene.render();
    }
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CharacterShowcase();
    });
} else {
    new CharacterShowcase();
}
