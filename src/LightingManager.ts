import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';

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

export class LightingManager {
    private hemisphericLight!: HemisphericLight;
    private directionalLight!: DirectionalLight;

    constructor(private scene: Scene) {
        this.initialize();
    }

    private initialize(): void {
        this.hemisphericLight = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            this.scene
        );
        this.hemisphericLight.intensity = LIGHTING_CONFIG.hemispheric.intensity;
        this.hemisphericLight.groundColor = new Color3(
            LIGHTING_CONFIG.hemispheric.groundColor.r,
            LIGHTING_CONFIG.hemispheric.groundColor.g,
            LIGHTING_CONFIG.hemispheric.groundColor.b
        );

        this.directionalLight = new DirectionalLight(
            "dirLight",
            new Vector3(
                LIGHTING_CONFIG.directional.direction.x,
                LIGHTING_CONFIG.directional.direction.y,
                LIGHTING_CONFIG.directional.direction.z
            ),
            this.scene
        );
        this.directionalLight.intensity = LIGHTING_CONFIG.directional.intensity;
    }

    public getHemisphericLight(): HemisphericLight {
        return this.hemisphericLight;
    }

    public getDirectionalLight(): DirectionalLight {
        return this.directionalLight;
    }
}
