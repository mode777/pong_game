export function bootstrapApplication(initializer: () => void | Promise<void>): void {
    // Initialize the application when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => await initializer());
    } else {
        initializer();
    }
}