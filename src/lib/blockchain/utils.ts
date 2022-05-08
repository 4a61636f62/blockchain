import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import {
  Block,
  Transaction,
  TransactionInput,
  TransactionOutput,
  UnminedBlock,
} from "./types";

export function createTXID(
  inputs: TransactionInput[],
  outputs: TransactionOutput[],
  timestamp: number
): string {
  return sha256(inputs.toString() + outputs.toString() + timestamp).toString();
}

function createBlockReward(minerAddress: string): Transaction {
  const blockRewardOutput: TransactionOutput = {
    address: minerAddress,
    amount: 100,
    index: 0,
  };
  const timestamp = Date.now();
  return {
    inputs: [],
    outputs: [blockRewardOutput],
    txid: createTXID([], [blockRewardOutput], timestamp),
    timestamp,
  };
}

function hashBlock(block: UnminedBlock, nonce: number): string {
  const data =
    block.prevHash +
    block.timestamp +
    JSON.stringify(block.txs) +
    block.minerAddress +
    nonce;
  return sha256(data).toString(Hex);
}

function mine(unminedBlock: UnminedBlock, difficulty: number): Block {
  let hash = "";
  let nonce = 0;

  do {
    nonce += 1;
    hash = hashBlock(unminedBlock, nonce);
  } while (!hash.startsWith("0".repeat(difficulty)));

  return {
    prevHash: unminedBlock.prevHash,
    timestamp: unminedBlock.timestamp,
    txs: unminedBlock.txs,
    minerAddress: unminedBlock.minerAddress,
    hash,
    nonce,
    difficulty,
  };
}

export function mineGenesisBlock(
  minerAddress: string,
  difficulty: number
): Block {
  return mine(
    {
      prevHash: "0",
      timestamp: Date.now(),
      txs: [createBlockReward(minerAddress)],
      minerAddress,
    },
    difficulty
  );
}

export function mineBlock(
  prevBlock: Block,
  txs: Transaction[],
  minerAddress: string
): Block {
  return mine(
    {
      prevHash: prevBlock.hash,
      timestamp: Date.now(),
      txs: [...txs, createBlockReward(minerAddress)],
      minerAddress,
    },
    prevBlock.difficulty
  );
}

export function validateBlock(block: Block, prevHash: string): boolean {
  return (
    hashBlock(block, block.nonce) === block.hash && block.prevHash === prevHash
  );
}

export function getTransactions(blocks: Block[]): Transaction[] {
  const txs: Transaction[] = [];
  blocks.forEach((b) => {
    txs.push(...b.txs);
  });
  return txs;
}

export function getUTXO(blocks: Block[]): Map<string, TransactionOutput[]> {
  const txs = getTransactions(blocks);
  const utxoMap = new Map<string, TransactionOutput[]>();

  for (let i = 0; i < txs.length; i += 1) {
    utxoMap.set(txs[i].txid, [...txs[i].outputs]);
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

export function getAddressBalances(blocks: Block[]): Map<string, number> {
  const utxo = Array.from(getUTXO(blocks).values()).flat();
  const map = new Map<string, number>();
  for (let i = 0; i < utxo.length; i += 1) {
    const balance = map.get(utxo[i].address) || 0;
    map.set(utxo[i].address, balance + utxo[i].amount);
  }
  return map;
}

export function getAddressUnconfirmedBalances(
  blocks: Block[],
  unconfirmedTransactions: Transaction[]
): Map<string, number> {
  const map = new Map<string, number>();
  const confirmedTransactions = getTransactions(blocks);

  unconfirmedTransactions.forEach((tx) => {
    tx.inputs.forEach((input) => {
      const inputTx = confirmedTransactions.filter(
        (t) => t.txid === input.txid
      )[0];
      const outputToSpend = inputTx.outputs[input.outputIndex];
      let balance = map.get(outputToSpend.address);
      if (!balance) balance = 0;
      map.set(outputToSpend.address, balance - outputToSpend.amount);
    });
    tx.outputs.forEach((output) => {
      let balance = map.get(output.address);
      if (!balance) balance = 0;
      map.set(output.address, balance + output.amount);
    });
  });
  return map;
}
