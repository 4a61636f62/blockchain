import {WsClient} from "./ws-client";
import {Message, MessageTypes} from "../../lib/message";
import {Block} from "../../blockchain/block";

export class BlockchainClient extends WsClient<Message> {
    announceBlock(block: Block): void {
        this.send({
            type: MessageTypes.NewBlockAnnouncement,
            correlationId: '1',
            payload: block
        })
    }
}