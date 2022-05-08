import { Message, MessageTypes } from "lib/message";
import * as Blockchain from "lib/blockchain";
import { WsClient } from "./ws-client";

const generateId = () => (Math.random() + 1).toString(36).substring(7);

export class BlockchainClient extends WsClient<Message> {
  announceBlock(block: Blockchain.Block): void {
    this.send({
      type: MessageTypes.NewBlockAnnouncement,
      correlationId: generateId(),
      payload: JSON.stringify(block),
    });
  }

  announceTransaction(transaction: Blockchain.Transaction): void {
    this.send({
      type: MessageTypes.TransactionAnnouncement,
      correlationId: generateId(),
      payload: JSON.stringify(transaction),
    });
  }

  requestLongestChain(): void {
    this.send({
      type: MessageTypes.ChainRequest,
      correlationId: generateId(),
    });
  }

  sendChain(blocks: Blockchain.Block[], correlationId: string): void {
    this.send({
      type: MessageTypes.ChainResponse,
      correlationId,
      payload: JSON.stringify(blocks),
    });
  }
}
