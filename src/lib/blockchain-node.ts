import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import {
  Block,
  UnminedBlock,
  Transaction,
  TransactionInput,
  TransactionOutput,
} from "./blockchain";

const HASH_REQUIREMENT = "0000";

export abstract class Node {
  static async mineGenesisBlock(minerAddress: string): Promise<Block> {
    return Node.mine({
      prevHash: "0",
      timestamp: Date.now(),
      txs: [this.createBlockReward(minerAddress)],
      minerAddress,
    });
  }

  static mineBlock(
    prevBlock: Block,
    txs: Transaction[],
    minerAddress: string
  ): Block {
    return Node.mine({
      prevHash: prevBlock.hash,
      timestamp: Date.now(),
      txs: [...txs, this.createBlockReward(minerAddress)],
      minerAddress,
    });
  }

  static validateBlock(block: Block, prevHash: string): boolean {
    return (
      this.hashBlock(block, block.nonce) === block.hash &&
      block.prevHash === prevHash
    );
  }

  static hashBlock(block: UnminedBlock, nonce: number): string {
    const data =
      block.prevHash +
      block.timestamp +
      JSON.stringify(block.txs) +
      nonce +
      block.minerAddress;
    return sha256(data).toString(Hex);
  }

  static createTXID(
    inputs: TransactionInput[],
    outputs: TransactionOutput[],
    timestamp: number
  ): string {
    return sha256(
      inputs.toString() + outputs.toString() + timestamp
    ).toString();
  }

  static getUTXO(blocks: Block[]): Map<string, TransactionOutput[]> {
    const txs = this.getTransactions(blocks);
    const utxoMap = new Map<string, TransactionOutput[]>();

    for (let i = 0; i < txs.length; i += 1) {
      utxoMap.set(txs[i].txid, txs[i].outputs);
      const { inputs } = txs[i];
      for (let j = 0; j < inputs.length; j += 1) {
        const outputs = utxoMap.get(inputs[j].txid);
        if (typeof outputs !== "undefined") {
          outputs.splice(inputs[j].outputIndex, 1);
          if (outputs.length === 0) {
            utxoMap.delete(inputs[j].txid);
          }
        }
      }
    }
    return utxoMap;
  }

  static getAddressBalances(blocks: Block[]): Map<string, number> {
    const utxo = Array.from(this.getUTXO(blocks).values()).flat();
    const map = new Map<string, number>();
    for (let i = 0; i < utxo.length; i += 1) {
      const balance = map.get(utxo[i].address) || 0;
      map.set(utxo[i].address, balance + utxo[i].amount);
    }
    return map;
  }

  static getTransactions(blocks: Block[]): Transaction[] {
    const txs: Transaction[] = [];
    blocks.forEach((b) => {
      txs.push(...b.txs);
    });
    return txs;
  }

  private static mine(unminedBlock: UnminedBlock): Block {
    let hash = "";
    let nonce = 0;

    do {
      nonce += 1;
      hash = Node.hashBlock(unminedBlock, nonce);
    } while (!hash.startsWith(HASH_REQUIREMENT));

    return {
      prevHash: unminedBlock.prevHash,
      timestamp: unminedBlock.timestamp,
      txs: unminedBlock.txs,
      minerAddress: unminedBlock.minerAddress,
      hash,
      nonce,
    };
  }

  private static createBlockReward(minerAddress: string): Transaction {
    const blockRewardOutput: TransactionOutput = {
      address: minerAddress,
      amount: 100,
    };
    const timestamp = Date.now();
    return {
      inputs: [],
      outputs: [blockRewardOutput],
      txid: this.createTXID([], [blockRewardOutput], timestamp),
      timestamp,
    };
  }
}
