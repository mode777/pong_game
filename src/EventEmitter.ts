type EventHandler<T> = (data: T) => void;

export class EventEmitter<T> {
    private handlers: EventHandler<T>[] = [];

    /**
     * Subscribe to events emitted by this emitter
     * @param handler Function to be called when event is emitted
     * @returns Unsubscribe function
     */
    public subscribe(handler: EventHandler<T>): () => void {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter(h => h !== handler);
        };
    }

    /**
     * Emit an event to all subscribed handlers
     * @param data Data to pass to event handlers
     */
    public emit(data: T): void {
        this.handlers.forEach(h => h(data));
    }

    /**
     * Check if there are any subscribers
     */
    public hasSubscribers(): boolean {
        return this.handlers.length > 0;
    }

    /**
     * Remove all subscribers
     */
    public clear(): void {
        this.handlers = [];
    }
}
