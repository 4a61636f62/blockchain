import { Block } from "../src/lib/blockchain";
import { Wallet } from "../src/lib/wallet";
import { BlockchainUtils } from "../src/lib/blockchain-utils";

describe("Blockchain Node", () => {
  test("getUTXO returns all unspent transaction outputs, does not include spent transaction outputs", async () => {
    const blocks: Block[] = [];
    const wallet1 = new Wallet();
    let block = await BlockchainUtils.mineGenesisBlock(wallet1.address);
    blocks.push(block);
    let utxoMap = BlockchainUtils.getUTXO(blocks);
    let utxo = utxoMap.get(blocks[0].txs[0].txid);
    expect(utxo).not.toBeUndefined();
    if (typeof utxo !== "undefined") {
      expect(utxo[0]).toEqual({ address: wallet1.address, amount: 100 });
    }

    const wallet2 = new Wallet();
    const tx = wallet1.createTransaction(wallet2.address, 100, blocks);
    expect(tx).not.toBeNull();
    if (tx) {
      block = await BlockchainUtils.mineBlock(blocks[0], [tx], wallet1.address);
      blocks.push(block);
    }

    utxoMap = BlockchainUtils.getUTXO(blocks);
    expect(utxoMap.get(blocks[0].txs[0].txid)).toBeUndefined();
    utxo = utxoMap.get(blocks[1].txs[0].txid);
    expect(utxo).not.toBeUndefined();
    if (typeof utxo !== "undefined") {
      expect(utxo[0]).toEqual({ address: wallet2.address, amount: 100 });
    }
  });
});
