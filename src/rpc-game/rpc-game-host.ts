import bind from "bind-decorator";
import { Logger } from "@local/common";
import { RpcConnection } from "@local/rpc";
import { JOIN_RPC, LOBBY_STATE_TOPIC, LobbyState, START_RPC } from "./contract";

export class RpcGameHost extends RpcConnection {

    readonly #logger = new Logger('RpcGameHost');
    readonly gameId: string;
    readonly #players = new Map<string, string>(); // Map of playerId -> playerName
    #lobbyState: LobbyState = "open";

    constructor(url: string, realm: string = "realm1") {
        super(url, realm);
        this.gameId = this.#generateGameId();
        this.#logger.info('Game host created with ID:', this.gameId);
        this.connected.subscribe(this.onConnected);
    }

    @bind
    private onConnected() {
        this.#logger.info('Connected, registering game endpoint: ', `game.${this.gameId}.join`);
        this.register(JOIN_RPC(this.gameId), this.onJoinGame);
        this.register(START_RPC(this.gameId), this.onStartGame);
        this.publishLobbyState();
    }

    @bind
    private async onJoinGame(playerName: string): Promise<string> {
        const playerId = crypto.randomUUID();
        this.#players.set(playerId, playerName);
        this.#logger.info('Player joined game:', playerName, ' gameId:', this.gameId, ' assigned ID:', playerId);
        return playerId;
    }

    @bind
    private async onStartGame(): Promise<void> {
        this.#logger.info('Starting game with ID:', this.gameId);
        //this.#logger.info('Game started with ID:', this.gameId, ' players:', Array.from(this.#players.values()));
        // Additional game start logic can be added here
        this.#lobbyState = 'closed';
        await this.publishLobbyState();
    }

    private async publishLobbyState(): Promise<void> {
        this.#logger.info('Publishing lobby state for game ID:', this.gameId, ' state:', this.#lobbyState);
        await this.publish(LOBBY_STATE_TOPIC(this.gameId), this.#lobbyState);
    }

    getPlayerName(playerId: string): string | undefined {
        return this.#players.get(playerId);
    }

    getPlayerIds(): string[] {
        return Array.from(this.#players.keys());
    }

    #generateGameId(): string {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    }
}
