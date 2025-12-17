import { EventEmitter, Logger } from "@local/common";
import { RpcConnection } from "@local/rpc";
import { JOIN_RPC, LOBBY_STATE_TOPIC, LobbyState, START_RPC } from "./contract";
import bind from "bind-decorator";

export class RpcGameClient extends RpcConnection {

    private logger = new Logger('RpcGameClient');
    private gameId?: string;
    private playerId?: string;
    private lobbyState: LobbyState = "open";

    lobbyClosed = new EventEmitter<void>();

    constructor(url: string, realm: string = "realm1") {
        super(url, realm);
    }

    async joinGame(gameId: string, playerName: string): Promise<void> {
        this.logger.info('Attempting to join game:', gameId, 'as:', playerName);
        this.gameId = gameId;
        this.playerId = await this.call<string,string>(JOIN_RPC(gameId), playerName);
        this.logger.info('Successfully joined game:', gameId, 'received player ID:', this.playerId);
        this.subscribe(LOBBY_STATE_TOPIC(gameId), this.onLobbyStateUpdate);
    }

    @bind    
    private onLobbyStateUpdate(state: LobbyState) {
        if (state === 'closed') {
            this.logger.info('Lobby state changed to closed for game ID:', this.gameId);
            this.lobbyClosed.emit();
        }
    }

    async startGame(): Promise<void> {
        if (!this.gameId) {
            this.logger.error('Cannot start game: no gameId set');
            throw new Error('Cannot start game: not joined to any game');
        }
        this.logger.info('Starting game with ID:', this.gameId);
        await this.call<void>(START_RPC(this.gameId));
        this.logger.info('Game started with ID:', this.gameId);
    }
}
