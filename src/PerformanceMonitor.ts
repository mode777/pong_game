import { EventEmitter } from './EventEmitter';

const FPS_UPDATE_INTERVAL = 1000;

export class PerformanceMonitor {
    public readonly onFpsUpdate = new EventEmitter<number>();
    
    private frameCount = 0;
    private lastFpsUpdate = performance.now();
    private fps = 0;

    public update(): void {
        this.frameCount++;
        const now = performance.now();

        if (now >= this.lastFpsUpdate + FPS_UPDATE_INTERVAL) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            this.onFpsUpdate.emit(this.fps);
        }
    }

    public getFPS(): number {
        return this.fps;
    }
}
