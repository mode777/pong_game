import { bootstrapApplication, CONSOLE_SINK, DomSink, Logger } from "@local/common";
import { RpcGameHost } from "@local/rpc-game";

bootstrapApplication(async () => {
    Logger.configureLogging({ defaultLevel: "info", sinks: [ CONSOLE_SINK, new DomSink() ] });
    const logger = new Logger("RPSHost");
    logger.info("Starting RPS Game Host...");
    const host = new RpcGameHost("wss://nexus.alexklingenbeck.de");
    await host.connect();
    logger.info("RPS Game Host started, game ID:", host.gameId);

    // Set up the Open Client button
    const openClientBtn = document.getElementById("open-client-btn");
    if (openClientBtn) {
        openClientBtn.addEventListener("click", () => {
            // exchange rps-host.html for rps-client.html
            const url = new URL(window.location.href);
            url.pathname = url.pathname.replace("rps-host.html", "rps-client.html");
            url.searchParams.set("gameId", host.gameId);
            
            // Check if there's a log parameter in the current URL
            const currentParams = new URLSearchParams(window.location.search);
            const logParam = currentParams.get("log");
            if (logParam) {
                url.searchParams.set("log", logParam);
            }
            
            window.open(url.toString(), "_blank");
            logger.info("Opening client in new tab:", url.toString());
        });
    }
});