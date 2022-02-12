import WebSocket from "ws";
import {WsServer} from "./ws-server";
import {Message, MessageTypes} from "../lib/message";

export class BlockchainServer extends WsServer<Message> {
    protected handleMessage(sender: WebSocket, message: Message): void {
        switch (message.type) {
            case MessageTypes.NewBlockAnnouncement: return this.handleNewBlockAnnouncement(sender, message)
        }
    }

    private handleNewBlockAnnouncement(sender: WebSocket, message: Message) {
        console.log("Received new block: ", message.payload)
        this.broadcastFrom(sender, message)
    }
}