import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

const CAMERA_CONFIG = {
    alpha: 0,
    beta: Math.PI / 3,
    radius: 4,
    lowerRadiusLimit: 2,
    upperRadiusLimit: 10,
};

const CAMERA_ROTATION_SPEED = 0.0005;
const CAMERA_RADIUS = 8;

export class CameraController {
    private camera: ArcRotateCamera;

    constructor(private scene: Scene, canvas: HTMLCanvasElement) {
        this.camera = this.initialize(canvas);
    }

    private initialize(canvas: HTMLCanvasElement): ArcRotateCamera {
        const camera = new ArcRotateCamera(
            "camera",
            CAMERA_CONFIG.alpha,
            CAMERA_CONFIG.beta,
            CAMERA_CONFIG.radius,
            new Vector3(0, 1, 0),
            this.scene
        );
        camera.attachControl(canvas, false);
        camera.lowerRadiusLimit = CAMERA_CONFIG.lowerRadiusLimit;
        camera.upperRadiusLimit = CAMERA_CONFIG.upperRadiusLimit;
        
        return camera;
    }

    public update(): void {
        const now = performance.now();
        const angle = now * CAMERA_ROTATION_SPEED;

        this.camera.alpha = angle;
        this.camera.radius = CAMERA_RADIUS;
    }

    public getCamera(): ArcRotateCamera {
        return this.camera;
    }
}
