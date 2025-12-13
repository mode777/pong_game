import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { EngineOptions, ScenePerformancePriority } from '@babylonjs/core';

const SCENE_BACKGROUND_COLOR = '#1a1a2e';

const ENGINE_CONFIG: EngineOptions = {
    antialias: false,
    adaptToDeviceRatio: false,
    powerPreference: "low-power" as const,
    preserveDrawingBuffer: false,
    stencil: false,
    depth: true,
};

export class SceneInitializer {
    private engine: Engine;
    private scene: Scene;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = this.initializeEngine();
        this.scene = this.initializeScene();
        this.setupWindowResize();
    }

    private initializeEngine(): Engine {
        const engine = new Engine(this.canvas, false, ENGINE_CONFIG);
        engine.setHardwareScalingLevel(1.5);
        return engine;
    }

    private initializeScene(): Scene {
        const scene = new Scene(this.engine);
        scene.performancePriority = ScenePerformancePriority.Aggressive;
        scene.clearColor = Color4.FromHexString(SCENE_BACKGROUND_COLOR);
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        scene.skipPointerDownPicking = true;
        scene.skipPointerMovePicking = true;
        scene.skipPointerUpPicking = true;
        return scene;
    }

    private setupWindowResize(): void {
        window.addEventListener('resize', () => this.handleWindowResize());
        this.handleWindowResize();
    }

    private handleWindowResize(): void {
        this.engine.resize();
    }

    public getEngine(): Engine {
        return this.engine;
    }

    public getScene(): Scene {
        return this.scene;
    }

    public startRenderLoop(callback: () => void): void {
        this.engine.runRenderLoop(callback);
    }
}
