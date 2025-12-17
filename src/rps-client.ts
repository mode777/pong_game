import { log } from "console";
import { bootstrapApplication, CONSOLE_SINK, DomSink, Logger } from "@local/common";
import { RpcGameClient } from "@local/rpc-game";

bootstrapApplication(async () => {
    Logger.configureLogging({ defaultLevel: "info", sinks: [ CONSOLE_SINK, new DomSink() ]});

    const logger = new Logger("RPSClient");
    logger.info("Starting RPS Game Client...");
    const client = new RpcGameClient("wss://nexus.alexklingenbeck.de");
    // read gameid from query string
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("gameId");
    if (!gameId) {
        logger.error("No gameId provided in query string");
        return;
    }

    await client.connect();
    await client.joinGame(gameId, "Alex");
    logger.info("RPS Game Client connected to game:", gameId);

    const startButton = document.getElementById('startGameButton');
    if (startButton) {
        startButton.onclick = async () => {
            try {
                await client.startGame();
                logger.info('Game started successfully.');
            } catch (error) {
                logger.error('Error starting game:', error);
            }
        };
    }
});