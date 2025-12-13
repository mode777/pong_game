import { SceneInitializer } from './SceneInitializer';
import { CameraController } from './CameraController';
import { LightingManager } from './LightingManager';
import { ModelLoader } from './ModelLoader';
import { AnimationController } from './AnimationController';
import { UIManager } from './UIManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import bind from 'bind-decorator';

// Constants
const CANVAS_ID = 'renderCanvas';

class CharacterShowcase {
    private sceneInitializer!: SceneInitializer;
    private cameraController!: CameraController;
    private modelLoader!: ModelLoader;
    private animationController!: AnimationController;
    private uiManager: UIManager;
    private performanceMonitor: PerformanceMonitor;
    
    constructor() {
        this.uiManager = new UIManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.animationController = new AnimationController();
        
        this.setupEventListeners();
        this.init();
    }

    private setupEventListeners(): void {
        // Subscribe to performance monitor events
        this.performanceMonitor.onFpsUpdate.subscribe(this.uiManager.updateFPS);

        // Subscribe to animation controller events
        this.animationController.onAnimationChange.subscribe((info) => {
            this.uiManager.updateAnimationName(info.name);
            const infoText = `${info.index} of ${info.total} | Duration: ${info.duration.toFixed(1)}s`;
            this.uiManager.updateAnimationInfo(infoText);
        });
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
        
        this.sceneInitializer = new SceneInitializer(canvas);
        const scene = this.sceneInitializer.getScene();
        
        this.cameraController = new CameraController(scene, canvas);
        new LightingManager(scene);
        this.modelLoader = new ModelLoader(scene);
        
        this.setupModelLoaderEvents();
        this.loadModel();
        this.startRenderLoop();
    }

    private setupModelLoaderEvents(): void {
        // Subscribe to model loader events
        this.modelLoader.onProgress.subscribe(({ loaded, total }) => {
            const percent = (loaded / total * 100).toFixed(0);
            this.uiManager.updateAnimationInfo(`Loading: ${percent}%`);
        });

        this.modelLoader.onError.subscribe(({ message, error }) => {
            console.error('Error loading model:', message, error);
            this.uiManager.updateAnimationName('Error loading model');
            this.uiManager.updateAnimationInfo(message || 'Unknown error');
        });
    }

    private async loadModel(): Promise<void> {
        this.uiManager.updateAnimationName('Loading model...');
        
        try {
            var result = await this.modelLoader.load();
            if (result.animationGroups && result.animationGroups.length > 0) {
                this.animationController.setup(result.animationGroups);
            } else {
                this.uiManager.updateAnimationName('No animations found');
                this.uiManager.updateAnimationInfo('Model loaded successfully');
            }
        } catch (error) {
            // Error already handled by event listeners
        }
    }

    private startRenderLoop(): void {
        this.sceneInitializer.startRenderLoop(this.animate);
    }
    
    @bind
    private animate(): void {
        this.performanceMonitor.update();
        this.cameraController.update();
        this.sceneInitializer.getScene().render();
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
