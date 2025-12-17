import { EventEmitter, Logger } from "@local/common";
import Wampy, { WampyOptions } from "wampy";



export class RpcConnection {
    readonly #wampy: Wampy;
    readonly #logger = new Logger("RpcConnection");
    #connected: boolean = false;

    readonly connected = new EventEmitter<void>();
    readonly reconnected = new EventEmitter<void>();
    readonly disconnected = new EventEmitter<void>();

    constructor(public readonly url: string, public readonly realm: string = "realm1") {
        this.#logger.debug('Creating RpcConnection', 'url:', url, 'realm:', realm);
        
        const wampyOptions: WampyOptions = {
            realm: realm,
            autoReconnect: true,
            maxRetries: 0,
            reconnectInterval: 2000,
            onClose: () => {
                this.#connected = false;
                this.#logger.warn('WAMP connection closed');
                this.disconnected.emit();
            },
            onError: () => {
                this.#logger.error('WAMP connection error');
            },
            onReconnect: () => {
                this.#logger.info('WAMP reconnecting...');
            },
            onReconnectSuccess: () => {
                this.#connected = true;
                this.#logger.info('WAMP reconnected successfully');
                this.reconnected.emit();
            }
        };
        
        this.#wampy = new Wampy(url, wampyOptions);
    }

    get isConnected(): boolean {
        return this.#connected;
    }

    async connect() {
        this.#logger.info('Connecting to WAMP server', 'url:', this.url, 'realm:', this.realm);
        try {
            await this.#wampy.connect();
            this.#connected = true;
            this.#logger.info('Successfully connected to WAMP server');
            this.connected.emit();
        } catch (error) {
            this.#logger.error('Failed to connect to WAMP server', error);
            throw error;
        }
    }

    async disconnect() {
        this.#logger.info('Disconnecting from WAMP server');
        try {
            await this.#wampy.disconnect();
            this.#connected = false;
            this.#logger.info('Successfully disconnected from WAMP server');
            this.disconnected.emit();
        } catch (error) {
            this.#logger.error('Error during disconnect', error);
            throw error;
        }
    }

    async call<TResult>(topic: string): Promise<TResult>;
    async call<TResult, A1>(topic: string, arg1: A1): Promise<TResult>;
    async call<TResult, A1, A2>(topic: string, arg1: A1, arg2: A2): Promise<TResult>;
    async call<TResult, A1, A2, A3>(topic: string, arg1: A1, arg2: A2, arg3: A3): Promise<TResult>;
    async call<TResult, A1, A2, A3, A4>(topic: string, arg1: A1, arg2: A2, arg3: A3, arg4: A4): Promise<TResult>;
    async call<TResult, A1, A2, A3, A4, A5>(topic: string, arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5): Promise<TResult>;
    async call(topic: string, ...args: any[]): Promise<any | void> {
        this.#ensureConnected();
        this.#logger.debug('Calling RPC method', 'topic:', topic, 'args:', args);
        try {
            var res = await this.#wampy.call(topic, args);
            const result = (res?.argsList)?.length > 0 ? res.argsList[0] : undefined;
            this.#logger.debug('RPC call successful', 'topic:', topic, 'result:', result);
            return result;
        } catch (error) {
            this.#logger.error('RPC call failed', 'topic:', topic, 'error:', error);
            throw error;
        }
    }

    async register(topic: string, handler: (...args: any[]) => any): Promise<void> {
        this.#ensureConnected();
        this.#logger.info('Registering RPC handler', 'topic:', topic);
        try {
            await this.#wampy.register(topic, (args) => {
                this.#logger.trace('RPC handler invoked', 'topic:', topic, 'args:', args.argsList);
                return handler(...(args?.argsList || []));
            });
            this.#logger.info('RPC handler registered successfully', 'topic:', topic);
        } catch (error) {
            this.#logger.error('Failed to register RPC handler', 'topic:', topic, 'error:', error);
            throw error;
        }
    }

    async publish(topic: string, payload: any): Promise<void> {
        this.#ensureConnected();
        this.#logger.debug('Publishing message', 'topic:', topic, 'payload:', payload);
        try {
            await this.#wampy.publish(topic, payload);
            this.#logger.debug('Message published successfully', 'topic:', topic);
        } catch (error) {
            this.#logger.error('Failed to publish message', 'topic:', topic, 'error:', error);
            throw error;
        }
    }

    async subscribe(topic: string, handler: (payload: any) => void): Promise<void> {
        this.#ensureConnected();
        this.#logger.info('Subscribing to topic', 'topic:', topic);
        try {
            await this.#wampy.subscribe(topic, (args) => {
                this.#logger.trace('Message received on topic', 'topic:', topic, 'payload:', args.argsList[0]);
                handler(args.argsList[0]);
            });
            this.#logger.info('Subscribed to topic successfully', 'topic:', topic);
        } catch (error) {
            this.#logger.error('Failed to subscribe to topic', 'topic:', topic, 'error:', error);
            throw error;
        }
    }

    #ensureConnected() {
        if (!this.#connected) {
            this.#logger.warn('Attempted operation while not connected');
            throw new Error("Not connected to WAMP server");
        }
    }
}
