
# WAMP based Game-framework

## Overall concept

This document specifies a communication framework that is built on top of the WAMP protocol.

This is a framework for games with the following chracteristics:
- There is a host that displays the main screen and runs the central control logic on a device with no or limited input capabilites (e.g. a Chromecast device)
- There are many clients that provide different input and interaction abilities on a smaller, second screen with input capabilities (e.g. a mobile phone)
- Both host and clients are usually in the same room
- Clients need a gameId to join the game 
- The gameId needs to be given to the clients manually (e.g. by scanning a qr code or reading a code from the host)

## Architecture

- Both host and client ci
- We will use WAMP as a communication protocol
- We introduce the concept of a Game 
- A Game is the definition of WAMP topics and rpc calls that are exchanged by the WAMP clients that participate in a GameInstance
- A GameInstances is a set of concrete clients that exchange data defined by the instances game. It is defined by the gameId.
- A GameInstance always has exactly one GameHost and can have many GameClients
- A GameHost has a LobbyState that can either be open or closed
- While the Lobby state is open players can join the GameInstance
- Once the game has started, the lobby is closed an no other players can join the game

## WAMP message architecture



# Implementation

```typescript
// Create these interfaces as classes in /src/connectivity/<class-name>.ts

type LobbyState = "open" | "closed"

interface GamePeer {
    constructor(url: string, options?: { realm?: string = "realm1", namespace?: string = "game" })
    // Connects to the wamp router
    connect(): Promise<void>
    get isConnected: boolean
}

// A game host hosts a single game instance
interface GameHost extends GamePeer {
    // Open the lobby and return gameId so players can join
    openLobby(): Promise<string>
    // Starts the game, closes the lobby
    startGame(): Promise
    get gameId
}

interface GameClient extends GamePeer {
    // join the game by rpc call
    join(gameId: string); Promise<string>
    // 
    gameStarted: EventEmitter<void>
}
```

- EventEmitter<T> implementation is comming from /src/common/event-emitter.ts
- All implementations should use logging from /src/common/log.ts
- Keep the wampy code simple: avoid optional arguments and special event callbacks