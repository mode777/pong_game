import { Application } from 'pixi.js';

export type PixiOptions = {
  width?: number;
  height?: number;
  background?: number;
  antialias?: boolean;
  parent?: HTMLElement | string;
  autoStart?: boolean;
};

export type PixiApp = Application;

export async function createPixiApp(options: PixiOptions = {}): Promise<PixiApp> {
  const {
    width = 800,
    height = 600,
    background = 0x1099bb,
    antialias = true,
    parent,
    autoStart,
  } = options;

  const app = new Application();
  await app.init({
    width,
    height,
    background,
    antialias,
    ...(autoStart !== undefined ? { autoStart } : {}),
  });

  let target: HTMLElement | null | undefined = undefined;
  if (typeof parent === 'string') {
    const el = document.querySelector(parent);
    target = el instanceof HTMLElement ? el : null;
  } else if (parent instanceof HTMLElement) {
    target = parent;
  }

  (target ?? document.body).appendChild(app.canvas);
  return app;
}
