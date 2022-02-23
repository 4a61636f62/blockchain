import WebSocket from "ws";
import { WsServer } from "./ws-server";
import { Message, MessageTypes, UUID } from "../lib/message";

type AwaitingResponses = {
  numSentTo: number;
  responses: Map<WebSocket, Message>;
};

export class BlockchainServer extends WsServer<Message> {
  sentMessagesAwaitingReply = new Map<UUID, AwaitingResponses>();

  receivedAwaitingResponse = new Map<UUID, WebSocket>();

  protected handleMessage(sender: WebSocket, message: Message): void {
    switch (message.type) {
      case MessageTypes.NewBlockAnnouncement:
        return this.handleAnnouncement(sender, message);
      case MessageTypes.TransactionAnnouncement:
        return this.handleAnnouncement(sender, message);
      case MessageTypes.ChainRequest:
        return this.handleChainRequest(sender, message);
      case MessageTypes.ChainResponse:
        return this.handleChainResponse(sender, message);
      default:
        throw new Error("Illegal Message Type Received");
    }
  }

  private handleAnnouncement(sender: WebSocket, message: Message) {
    this.broadcastFrom(sender, message);
  }

  private handleChainRequest(sender: WebSocket, message: Message) {
    if (this.clients.size > 1) {
      this.receivedAwaitingResponse.set(message.correlationId, sender);
      const numSentTo = this.broadcastFrom(sender, message);
      this.sentMessagesAwaitingReply.set(message.correlationId, {
        numSentTo,
        responses: new Map<WebSocket, Message>(),
      });
    } else {
      sender.send(
        JSON.stringify({
          type: MessageTypes.ChainResponse,
          correlationId: message.correlationId,
        })
      );
    }
  }

  private handleChainResponse(sender: WebSocket, message: Message) {
    const requester = this.receivedAwaitingResponse.get(message.correlationId);
    const awaitingResponses = this.sentMessagesAwaitingReply.get(
      message.correlationId
    );
    if (requester && awaitingResponses) {
      awaitingResponses.responses.set(sender, message);
      if (awaitingResponses.responses.size === awaitingResponses.numSentTo) {
        const longestChain = Array.from(
          awaitingResponses.responses.values()
        ).reduce((prev, curr) =>
          typeof prev.payload !== "undefined" &&
          typeof curr.payload !== "undefined" &&
          prev.payload.length < curr.payload.length
            ? curr
            : prev
        ).payload;
        requester.send(
          JSON.stringify({
            type: MessageTypes.ChainResponse,
            correlationId: message.correlationId,
            payload: longestChain,
          })
        );
      }
    }
  }
}
