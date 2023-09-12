const express = require("express");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const sequelize = require("./db");
require("pg");
const ws = require("ws");
const router = require("./routes/routes");
var whitelistDomain = [
    "http://localhost:5173",
    "https://inspiring-brioche-84df34.netlify.app",
];

class Server {
    app = express();
    async start() {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
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
                origin: function (origin, callback) {
                    const originIsWhitelisted = whitelistDomain.indexOf(origin) !== -1;
                    callback(null, originIsWhitelisted);
                },
            })
        );
        this.app.use(express.json());
        this.app.use("/api", router);
    }

    createWS(server) {
        const webSocketServer = new ws.Server({ server });
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
