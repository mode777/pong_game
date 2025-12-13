import bind from "bind-decorator";

interface UIElements {
    animationName: HTMLElement | null;
    animationInfo: HTMLElement | null;
    fpsCounter: HTMLElement | null;
}

export class UIManager {
    private ui: UIElements;

    constructor() {
        this.ui = this.initializeUIElements();
    }

    private initializeUIElements(): UIElements {
        return {
            animationName: document.getElementById('animation-name'),
            animationInfo: document.getElementById('animation-info'),
            fpsCounter: document.getElementById('fps-counter'),
        };
    }

    public updateAnimationName(text: string): void {
        this.updateText(this.ui.animationName, text);
    }

    public updateAnimationInfo(text: string): void {
        this.updateText(this.ui.animationInfo, text);
    }
    
    @bind
    public updateFPS(fps: number): void {
        this.updateText(this.ui.fpsCounter, `FPS: ${fps}`);
    }

    private updateText(element: HTMLElement | null, text: string): void {
        if (element) {
            element.textContent = text;
        }
    }
}
