Convert this project to typescript using best practices and tooling for web projects

- Convert /src/main.js to Typescript
- Set up the project for typescript in the browser which uses vite for bundling dependecies
- Adopt the /package.json to load all dependencies and for vite
- Adapt /index.html to no longer use CDN for babylon, use a dedicated css file to be created in /css/styles.css, load the bundled js file
- Add a definition for a github action so the project can be built before it is hosted gy github pages. Add instructions what has to be configured in the github repo for the built page to be hosted