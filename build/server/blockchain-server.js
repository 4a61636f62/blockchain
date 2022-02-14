"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainServer = void 0;
const ws_server_1 = require("./ws-server");
const message_1 = require("../lib/message");
class BlockchainServer extends ws_server_1.WsServer {
    handleMessage(sender, message) {
        switch (message.type) {
            case message_1.MessageTypes.NewBlockAnnouncement: return this.handleNewBlockAnnouncement(sender, message);
        }
    }
    handleNewBlockAnnouncement(sender, message) {
        this.broadcastFrom(sender, message);
    }
}
exports.BlockchainServer = BlockchainServer;
//# sourceMappingURL=blockchain-server.js.map