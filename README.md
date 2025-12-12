# Babylon.js Character Showcase - TypeScript Edition

A high-performance 3D character showcase built with Babylon.js, TypeScript, and Vite.

## Features

- ✨ TypeScript for type safety
- ⚡ Vite for fast development and optimized builds
- 🎨 Babylon.js 7.x for 3D rendering
- 🚀 Automated GitHub Pages deployment
- 📦 Modular bundling with code splitting

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `master` branch.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select **GitHub Actions**

2. **Update the base path (if needed):**
   - If your repository name is different from `pong_game`, update the `base` property in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   });
   ```

3. **Push to master branch:**
   ```bash
   git add .
   git commit -m "Setup TypeScript and Vite"
   git push origin master
   ```

4. **Wait for the workflow to complete:**
   - Go to the **Actions** tab in your repository
   - Wait for the "Deploy to GitHub Pages" workflow to finish
   - Your site will be available at: `https://<username>.github.io/pong_game/`

### Manual Deployment

If you need to trigger a deployment manually:
- Go to the **Actions** tab
- Select the "Deploy to GitHub Pages" workflow
- Click **Run workflow**
- Select the `master` branch and click **Run workflow**

## Project Structure

```
pong_game/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── assets/
│   └── Characters.glb          # 3D model
├── css/
│   └── styles.css              # Application styles
├── src/
│   └── main.ts                 # Main TypeScript application
├── index.html                  # Entry HTML file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## Technologies

- [Babylon.js](https://www.babylonjs.com/) - 3D engine
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [GitHub Actions](https://github.com/features/actions) - CI/CD

## License

ISC
