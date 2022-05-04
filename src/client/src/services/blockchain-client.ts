import { Message, MessageTypes } from "lib/message";
import * as Blockchain from "lib/blockchain";
import { WsClient } from "./ws-client";

export class BlockchainClient extends WsClient<Message> {
  announceBlock(block: Blockchain.Block): void {
    this.send({
      type: MessageTypes.NewBlockAnnouncement,
      correlationId: "1",
      payload: JSON.stringify(block),
    });
  }

  announceTransaction(transaction: Blockchain.Transaction): void {
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

  sendChain(blocks: Blockchain.Block[]): void {
    this.send({
      type: MessageTypes.ChainResponse,
      correlationId: "1",
      payload: JSON.stringify(blocks),
    });
  }
}
