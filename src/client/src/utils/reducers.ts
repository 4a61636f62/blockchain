import { Message } from "lib/message";
import * as Blockchain from "lib/blockchain/";
import { BlockchainClient } from "../services/blockchain-client";

export type State = {
  client: BlockchainClient;
  blocks: Blockchain.Block[];
  transactions: Blockchain.Transaction[];
  wallet: Blockchain.Wallet;
};

export type Action =
  | { type: "add-block"; block: Blockchain.Block }
  | { type: "add-transaction"; transaction: Blockchain.Transaction }
  | { type: "send-block-announcement"; block: Blockchain.Block }
  | {
      type: "send-transaction-announcement";
      transaction: Blockchain.Transaction;
    }
  | { type: "send-chain-request" }
  | { type: "handle-block-announcement"; message: Message }
  | { type: "handle-transaction-announcement"; message: Message }
  | { type: "handle-chain-request" }
  | { type: "handle-chain-response"; message: Message };

const removeConfirmedTransactions = (
  transactions: Blockchain.Transaction[],
  block: Blockchain.Block
): Blockchain.Transaction[] =>
  transactions.filter((t) => {
    for (let i = 0; i < block.txs.length; i += 1) {
      if (block.txs[i].txid === t.txid) {
        return false;
      }
    }
    return true;
  });

const addBlock = (state: State, block: Blockchain.Block): State => ({
  ...state,
  blocks: [...state.blocks, block],
  transactions: removeConfirmedTransactions(state.transactions, block),
});

const addTransaction = (
  state: State,
  transaction: Blockchain.Transaction
): State => ({
  ...state,
  transactions: [...state.transactions, transaction],
});

const handleBlockAnnouncement = (state: State, message: Message): State => {
  if (typeof message.payload !== "undefined") {
    const block = JSON.parse(message.payload) as Blockchain.Block;
    if (
      state.blocks.length < 1 ||
      Blockchain.validateBlock(
        block,
        state.blocks[state.blocks.length - 1].hash
      )
    ) {
      return addBlock(state, block);
    }
  }
  return state;
};

const handleTransactionAnnouncement = (
  state: State,
  message: Message
): State => {
  if (typeof message.payload !== "undefined") {
    const transaction = JSON.parse(message.payload) as Blockchain.Transaction;
    return addTransaction(state, transaction);
  }
  return state;
};

const handleChainResponse = (state: State, message: Message): State => {
  let blocks: Blockchain.Block[] = [];
  if (typeof message.payload !== "undefined") {
    blocks = JSON.parse(message.payload);
  }
  return { ...state, blocks };
};

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case "add-block":
      return addBlock(state, action.block);
    case "add-transaction":
      return addTransaction(state, action.transaction);
    case "send-block-announcement":
      state.client.announceBlock(action.block);
      return state;
    case "send-transaction-announcement":
      state.client.announceTransaction(action.transaction);
      return state;
    case "send-chain-request":
      state.client.requestLongestChain();
      return state;
    case "handle-chain-request":
      state.client.sendChain(state.blocks);
      return state;
    case "handle-block-announcement":
      return handleBlockAnnouncement(state, action.message);
    case "handle-transaction-announcement":
      return handleTransactionAnnouncement(state, action.message);
    case "handle-chain-response":
      return handleChainResponse(state, action.message);
    default:
      return state;
  }
}
