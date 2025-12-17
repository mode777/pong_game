import { createPixiApp } from './pixi/index';
import { Graphics, Text, TextStyle, Container } from 'pixi.js';

async function main() {
  const app = await createPixiApp({
    width: window.innerWidth,
    height: window.innerHeight,
    background: 0x1a1a2e,
    parent: '#pixi-root',
  });

  // Title
  const titleStyle = new TextStyle({
    fontSize: 32,
    fontWeight: 'bold',
    fill: 0x00d4ff,
    align: 'center',
  });
  const title = new Text('PixiJS Demo', titleStyle);
  title.position.set(app.canvas.width / 2, 30);
  title.anchor.set(0.5, 0);
  app.stage.addChild(title);

  // Draw some circles
  const colors = [0xff0066, 0x00ff99, 0xffcc00, 0x0099ff];
  const centerY = app.canvas.height / 2 - 50;
  for (let i = 0; i < 4; i++) {
    const circle = new Graphics();
    circle.circle(0, 0, 40);
    circle.fill(colors[i]);
    circle.position.set(app.canvas.width / 4 + (i * app.canvas.width / 4), centerY);
    app.stage.addChild(circle);
  }

  // Draw a rectangle
  const rect = new Graphics();
  rect.rect(0, 0, 200, 100);
  rect.fill(0x9d4edd);
  rect.position.set(app.canvas.width / 2 - 100, app.canvas.height - 200);
  app.stage.addChild(rect);

  // Label
  const labelStyle = new TextStyle({
    fontSize: 16,
    fill: 0xffffff,
  });
  const label = new Text('Interactive Graphics', labelStyle);
  label.position.set(app.canvas.width / 2 - 90, app.canvas.height - 160);
  app.stage.addChild(label);

  // Animation loop
  let time = 0;
  app.ticker.add(() => {
    time += 0.016;
    // Rotate shapes and update positions slightly
    app.stage.children.forEach((child: Container, i: number) => {
      if (child !== title && child !== label) {
        child.rotation = time * 0.5 + i * 0.5;
      }
    });
  });

  console.log('PixiJS demo app initialized!');
}

main().catch(err => console.error('Failed to initialize Pixi app:', err));
