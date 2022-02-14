"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsServer = void 0;
const ws_1 = __importDefault(require("ws"));
class WsServer {
    constructor(server) {
        this.subscribe = (ws) => {
            ws.on('message', (data) => {
                this.handleMessage(ws, JSON.parse(data.toString()));
            });
        };
        this.cleanup = () => {
            this.wss.clients.forEach(client => {
                if (!WsServer.isAlive(client)) {
                    this.wss.clients.delete(client);
                }
            });
        };
        this.wss = new ws_1.default.Server({ server });
        this.wss.on("connection", this.subscribe);
        this.wss.on("close", this.cleanup);
    }
    broadcastFrom(sender, message) {
        this.wss.clients.forEach(client => {
            if (WsServer.isAlive(client) && client !== sender) {
                client.send(JSON.stringify(message));
            }
        });
    }
    static isAlive(client) {
        return (client.readyState !== ws_1.default.CLOSING && client.readyState !== ws_1.default.CLOSED);
    }
}
exports.WsServer = WsServer;
//# sourceMappingURL=ws-server.js.map