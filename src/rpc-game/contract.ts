const GAME_PREFIX = 'game';

export const START_RPC = (gameId: string) => `${GAME_PREFIX}.${gameId}.start`;
export const JOIN_RPC = (gameId: string) => `${GAME_PREFIX}.${gameId}.join`;
export const LOBBY_STATE_TOPIC = (gameId: string) => `${GAME_PREFIX}.${gameId}.lobbyState`;

export type LobbyState = "open" | "closed"