import { Message, MessageTypes } from "lib/message";
import { Block, Transaction } from "lib/blockchain";
import { WsClient } from "./ws-client";

export class BlockchainClient extends WsClient<Message> {
  announceBlock(block: Block): void {
    this.send({
      type: MessageTypes.NewBlockAnnouncement,
      correlationId: "1",
      payload: JSON.stringify(block),
    });
  }

  announceTransaction(transaction: Transaction): void {
    this.send({
      type: MessageTypes.TransactionAnnouncement,
      correlationId: "1",
      payload: JSON.stringify(transaction),
    });
  }

  requestLongestChain(): void {
    this.send({
      type: MessageTypes.ChainRequest,
      correlationId: "1",
    });
  }

  sendChain(blocks: Block[]): void {
    this.send({
      type: MessageTypes.ChainResponse,
      correlationId: "1",
      payload: JSON.stringify(blocks),
    });
  }
}
