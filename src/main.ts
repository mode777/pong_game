import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';
import { EngineOptions } from '@babylonjs/core';

// Constants
const CANVAS_ID = 'renderCanvas';
const MODEL_PATH = './assets/';
const MODEL_FILENAME = 'Characters.glb';
const SCENE_BACKGROUND_COLOR = '#1a1a2e';
const FPS_UPDATE_INTERVAL = 1000;
const ANIMATION_DELAY = 500;
const CAMERA_ROTATION_SPEED = 0.0005;
const CAMERA_RADIUS = 8;
const RANDOM_POSITION_RADIUS = 10;

// Engine configuration
const ENGINE_CONFIG : EngineOptions = {
    antialias: false,
    adaptToDeviceRatio: false,
    powerPreference: "low-power" as const,
    preserveDrawingBuffer: false,
    stencil: false,
    depth: true,
};

// Camera configuration
const CAMERA_CONFIG = {
    alpha: 0,
    beta: Math.PI / 3,
    radius: 4,
    lowerRadiusLimit: 2,
    upperRadiusLimit: 10,
};

// Lighting configuration
const LIGHTING_CONFIG = {
    hemispheric: {
        intensity: 1.5,
        groundColor: { r: 0.3, g: 0.3, b: 0.4 },
    },
    directional: {
        direction: { x: -1, y: -2, z: -1 },
        intensity: 0.6,
    },
};

interface UIElements {
    animationName: HTMLElement | null;
    animationInfo: HTMLElement | null;
    fpsCounter: HTMLElement | null;
}

class CharacterShowcase {
    private currentAnimationIndex = 0;
    private animationGroups: AnimationGroup[] = [];
    private frameCount = 0;
    private lastFpsUpdate = performance.now();
    private fps = 0;
    private engine!: Engine;
    private scene!: Scene;
    private camera!: ArcRotateCamera;
    private model?: AbstractMesh;
    private ui: UIElements;
    
    constructor() {
        this.ui = this.initializeUIElements();
        this.init();
    }
    
    private initializeUIElements(): UIElements {
        return {
            animationName: document.getElementById('animation-name'),
            animationInfo: document.getElementById('animation-info'),
            fpsCounter: document.getElementById('fps-counter'),
        };
    }

    private getCanvasElement(): HTMLCanvasElement | null {
        const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
        
        if (!canvas) {
            console.error(`Canvas element with id '${CANVAS_ID}' not found`);
        }
        
        return canvas;
    }
    
    private init(): void {
        const canvas = this.getCanvasElement();
        
        if (!canvas) {
            return;
        }
        
        this.initializeEngine(canvas);
        this.initializeScene();
        this.initializeCamera(canvas);
        this.initializeLighting();
        this.loadModel();
        this.setupWindowResize();
        this.startRenderLoop();
    }

    private initializeEngine(canvas: HTMLCanvasElement): void {
        this.engine = new Engine(canvas, false, ENGINE_CONFIG);
        this.engine.setHardwareScalingLevel(2.0);
    }

    private initializeScene(): void {
        this.scene = new Scene(this.engine);
        this.scene.clearColor = Color4.FromHexString(SCENE_BACKGROUND_COLOR);
        this.scene.autoClear = false;
        this.scene.autoClearDepthAndStencil = false;
    }

    private initializeCamera(canvas: HTMLCanvasElement): void {
        this.camera = new ArcRotateCamera(
            "camera",
            CAMERA_CONFIG.alpha,
            CAMERA_CONFIG.beta,
            CAMERA_CONFIG.radius,
            new Vector3(0, 1, 0),
            this.scene
        );
        this.camera.attachControl(canvas, false);
        this.camera.lowerRadiusLimit = CAMERA_CONFIG.lowerRadiusLimit;
        this.camera.upperRadiusLimit = CAMERA_CONFIG.upperRadiusLimit;
    }

    private initializeLighting(): void {
        const hemisphericLight = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            this.scene
        );
        hemisphericLight.intensity = LIGHTING_CONFIG.hemispheric.intensity;
        hemisphericLight.groundColor = new Color3(
            LIGHTING_CONFIG.hemispheric.groundColor.r,
            LIGHTING_CONFIG.hemispheric.groundColor.g,
            LIGHTING_CONFIG.hemispheric.groundColor.b
        );
        
        const directionalLight = new DirectionalLight(
            "dirLight",
            new Vector3(
                LIGHTING_CONFIG.directional.direction.x,
                LIGHTING_CONFIG.directional.direction.y,
                LIGHTING_CONFIG.directional.direction.z
            ),
            this.scene
        );
        directionalLight.intensity = LIGHTING_CONFIG.directional.intensity;
    }

    private setupWindowResize(): void {
        window.addEventListener('resize', () => this.handleWindowResize());
        this.handleWindowResize();
    }

    private startRenderLoop(): void {
        this.engine.runRenderLoop(() => {
            this.animate();
        });
    }
    
    private updateUIText(element: HTMLElement | null, text: string): void {
        if (element) {
            element.textContent = text;
        }
    }

    private async loadModel(): Promise<void> {
        this.updateUIText(this.ui.animationName, 'Loading model...');
        
        try {
            const result = await ImportMeshAsync(
                MODEL_PATH + MODEL_FILENAME,
                this.scene,
                {
                    onProgress: (event) => {
                        this.handleLoadProgress(event);
                    }
                }
            );
            
            this.handleModelLoaded(result.meshes, result.animationGroups);
        } catch (error) {
            this.handleLoadError(
                error instanceof Error ? error.message : 'Unknown error',
                error
            );
        }
    }

    private handleModelLoaded(
        meshes: AbstractMesh[],
        animationGroups: AnimationGroup[]
    ): void {
        if (meshes.length > 0) {
            this.setupModel(meshes);
        }
        
        if (animationGroups && animationGroups.length > 0) {
            this.setupAnimations(animationGroups);
        } else {
            this.updateUIText(this.ui.animationName, 'No animations found');
            this.updateUIText(this.ui.animationInfo, 'Model loaded successfully');
        }
    }

    private setupModel(meshes: AbstractMesh[]): void {
        this.model = meshes[0];
        
        this.centerModel();
        this.optimizeMeshes(meshes);
        
        console.log(`Loaded ${meshes.length} meshes`);
    }

    private centerModel(): void {
        if (!this.model) return;

        const boundingInfo = this.model.getHierarchyBoundingVectors();
        const center = Vector3.Center(boundingInfo.min, boundingInfo.max);
        
        this.model.position.x = -center.x;
        this.model.position.y = -boundingInfo.min.y;
        this.model.position.z = -center.z;
    }

    private optimizeMeshes(meshes: AbstractMesh[]): void {
        meshes.forEach((mesh) => {
            console.log(mesh.name);
            
            if (mesh.material) {
                mesh.material.freeze();
            }
            
            mesh.receiveShadows = false;

            if (mesh.name !== "__root__") {
                this.randomizePosition(mesh);
            }
        });
    }

    private randomizePosition(mesh: AbstractMesh): void {
        mesh.position.x += (Math.random() - 0.5) * RANDOM_POSITION_RADIUS;
        mesh.position.z += (Math.random() - 0.5) * RANDOM_POSITION_RADIUS;
    }

    private setupAnimations(animationGroups: AnimationGroup[]): void {
        this.animationGroups = animationGroups;
        
        this.animationGroups.forEach(ag => ag.stop());
        
        console.log(
            `Found ${this.animationGroups.length} animations:`,
            this.animationGroups.map(ag => ag.name)
        );
        
        this.playNextAnimation();
    }

    private handleLoadProgress(event: any): void {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total * 100).toFixed(0);
            this.updateUIText(this.ui.animationInfo, `Loading: ${percent}%`);
        }
    }

    private handleLoadError(message?: string, exception?: any): void {
        console.error('Error loading model:', message, exception);
        this.updateUIText(this.ui.animationName, 'Error loading model');
        this.updateUIText(this.ui.animationInfo, message || 'Unknown error');
    }
    
    private playNextAnimation(): void {
        if (this.animationGroups.length === 0) return;
        
        this.stopAllAnimations();
        
        const animGroup = this.animationGroups[this.currentAnimationIndex];
        
        this.updateAnimationUI(animGroup);
        this.startAnimation(animGroup);
        this.scheduleNextAnimation(animGroup);
    }

    private stopAllAnimations(): void {
        this.animationGroups.forEach(ag => ag.stop());
    }

    private updateAnimationUI(animGroup: AnimationGroup): void {
        const animationName = animGroup.name || `Animation ${this.currentAnimationIndex + 1}`;
        this.updateUIText(this.ui.animationName, animationName);
        
        const duration = this.calculateAnimationDuration(animGroup);
        const infoText = `${this.currentAnimationIndex + 1} of ${this.animationGroups.length} | Duration: ${duration.toFixed(1)}s`;
        this.updateUIText(this.ui.animationInfo, infoText);
    }

    private calculateAnimationDuration(animGroup: AnimationGroup): number {
        const ASSUMED_FPS = 60;
        return (animGroup.to - animGroup.from) / ASSUMED_FPS;
    }

    private startAnimation(animGroup: AnimationGroup): void {
        animGroup.reset();
        animGroup.start(false, 1.0, animGroup.from, animGroup.to);
    }

    private scheduleNextAnimation(animGroup: AnimationGroup): void {
        animGroup.onAnimationEndObservable.addOnce(() => {
            setTimeout(() => {
                this.currentAnimationIndex = 
                    (this.currentAnimationIndex + 1) % this.animationGroups.length;
                this.playNextAnimation();
            }, ANIMATION_DELAY);
        });
    }
    
    private handleWindowResize(): void {
        this.engine.resize();
    }
    
    private animate(): void {
        this.updateFPS();
        this.updateCameraPosition();
        this.scene.render();
    }

    private updateFPS(): void {
        this.frameCount++;
        const now = performance.now();
        
        if (now >= this.lastFpsUpdate + FPS_UPDATE_INTERVAL) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            this.updateUIText(this.ui.fpsCounter, `FPS: ${this.fps}`);
        }
    }

    private updateCameraPosition(): void {
        const now = performance.now();
        const angle = now * CAMERA_ROTATION_SPEED;
        
        this.camera.alpha = angle;
        this.camera.radius = CAMERA_RADIUS;
    }
}

function initializeApplication(): void {
    new CharacterShowcase();
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}
