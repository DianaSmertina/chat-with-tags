const express = require("express");
const PORT = process.env.PORT || 5000;
require("./db");
require("pg");
const cors = require("cors");
const ws = require("ws");

class Server {
    app = express();
    start() {
        try {
            const currentServer = this.app.listen(PORT, () => {
                console.log(`server start on port ${PORT}`);
            });
            this.addMiddleware();
            this.createWS(currentServer);
        } catch (e) {
            console.log(e);
        }
    }

    addMiddleware() {
        this.app.use(
            cors({
                origin: "http://localhost:5173",
            })
        );
        this.app.use(express.json());
    }

    createWS(server) {
        const webSocketServer = new ws.Server({server});
        webSocketServer.on("connection", (ws) => {
            ws.on("message", (message) => {
                webSocketServer.clients.forEach((client) =>
                    client.send(message)
                );
            });
            ws.on("error", (e) => ws.send(e));
        });
    }
}

new Server().start();
