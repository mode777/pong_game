import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { EventEmitter } from './EventEmitter';

const ANIMATION_DELAY = 500;
const ASSUMED_FPS = 60;

export interface AnimationInfo {
    name: string;
    index: number;
    total: number;
    duration: number;
}

export class AnimationController {
    public readonly onAnimationChange = new EventEmitter<AnimationInfo>();
    
    private animationGroups: AnimationGroup[] = [];
    private currentAnimationIndex = 0;

    public setup(animationGroups: AnimationGroup[]): void {
        this.animationGroups = animationGroups;
        this.animationGroups.forEach(ag => ag.stop());

        console.log(
            `Found ${this.animationGroups.length} animations:`,
            this.animationGroups.map(ag => ag.name)
        );

        if (this.animationGroups.length > 0) {
            this.playNextAnimation();
        }
    }

    public playNextAnimation(): void {
        if (this.animationGroups.length === 0) return;

        this.stopAllAnimations();

        const animGroup = this.animationGroups[this.currentAnimationIndex];
        
        this.onAnimationChange.emit(this.getAnimationInfo(animGroup));

        this.startAnimation(animGroup);
        this.scheduleNextAnimation(animGroup);
    }

    private stopAllAnimations(): void {
        this.animationGroups.forEach(ag => ag.stop());
    }

    private getAnimationInfo(animGroup: AnimationGroup): AnimationInfo {
        return {
            name: animGroup.name || `Animation ${this.currentAnimationIndex + 1}`,
            index: this.currentAnimationIndex + 1,
            total: this.animationGroups.length,
            duration: this.calculateAnimationDuration(animGroup),
        };
    }

    private calculateAnimationDuration(animGroup: AnimationGroup): number {
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

    public getAnimationGroups(): AnimationGroup[] {
        return this.animationGroups;
    }

    public getCurrentIndex(): number {
        return this.currentAnimationIndex;
    }
}
