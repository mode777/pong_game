import { Scene } from '@babylonjs/core/scene';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { EventEmitter } from './EventEmitter';
import '@babylonjs/loaders/glTF';

const MODEL_PATH = './assets/';
const MODEL_FILENAME = 'Characters.glb';
const RANDOM_POSITION_RADIUS = 10;

export interface ModelLoadResult {
    meshes: AbstractMesh[];
    animationGroups: AnimationGroup[];
}

export interface LoadProgress {
    loaded: number;
    total: number;
}

export interface LoadError {
    message: string;
    error?: any;
}

export class ModelLoader {
    public readonly onProgress = new EventEmitter<LoadProgress>();
    public readonly onError = new EventEmitter<LoadError>();
    public readonly onLoaded = new EventEmitter<ModelLoadResult>();
    
    private model?: AbstractMesh;

    constructor(private scene: Scene) {}

    public async load(): Promise<ModelLoadResult> {
        try {
            const result = await ImportMeshAsync(
                MODEL_PATH + MODEL_FILENAME,
                this.scene,
                {
                    onProgress: (event) => {
                        if (event.lengthComputable) {
                            this.onProgress.emit({
                                loaded: event.loaded,
                                total: event.total
                            });
                        }
                    }
                }
            );

            if (result.meshes.length > 0) {
                this.setupModel(result.meshes);
            }

            const modelResult: ModelLoadResult = {
                meshes: result.meshes,
                animationGroups: result.animationGroups,
            };

            this.onLoaded.emit(modelResult);
            return modelResult;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.onError.emit({ message, error });
            throw error;
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

    public getModel(): AbstractMesh | undefined {
        return this.model;
    }
}
