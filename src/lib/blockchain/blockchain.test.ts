import sha256 from "crypto-js/sha256";
import {
  Block,
  getAddressBalances,
  getAddressUnconfirmedBalances,
  getTransactions,
  getUTXO,
  mineBlock,
  mineGenesisBlock,
  Transaction,
  Wallet,
} from "./index";

describe("Blockchain library", () => {
  let transactions: Transaction[];
  let blocks: Block[];
  let unconfirmedTxs: Transaction[];
  beforeEach(() => {
    // initialise test data
    transactions = [
      {
        // output 100 to 'address1' and 'address2'
        txid: "txid1",
        inputs: [],
        outputs: [
          {
            address: "address1",
            amount: 100,
            index: 0,
          },
          {
            address: "address2",
            amount: 100,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // output 100 to 'address3' and 'address4'
        txid: "txid2",
        inputs: [],
        outputs: [
          {
            address: "address3",
            amount: 100,
            index: 0,
          },
          {
            address: "address4",
            amount: 100,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 50 from 'address1' to 'address2', spending 'address1s' original output
        // & returning change to 'address1' in new output
        txid: "txid3",
        inputs: [
          {
            txid: "txid1",
            outputIndex: 0,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address2",
            amount: 50,
            index: 0,
          },
          {
            address: "address1",
            amount: 50,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 50 from 'address3' to 'address4', spending 'address4s' original output
        // & returning change to 'address3' in new output
        txid: "txid4",
        inputs: [
          {
            txid: "txid2",
            outputIndex: 0,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address4",
            amount: 50,
            index: 0,
          },
          {
            address: "address3",
            amount: 50,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
    ];

    blocks = [
      {
        minerAddress: "miner1",
        hash: "hash1",
        prevHash: "hash1",
        nonce: 1,
        txs: [transactions[0], transactions[1]],
        timestamp: Date.now(),
        difficulty: 1,
      },
      {
        minerAddress: "miner2",
        hash: "hash2",
        prevHash: "hash2",
        nonce: 2,
        txs: [transactions[2], transactions[3]],
        timestamp: Date.now(),
        difficulty: 2,
      },
    ];

    unconfirmedTxs = [
      {
        // transfer 50 from 'address1' to 'address2' spending 'address1's output from txid3
        txid: "txid5",
        inputs: [
          {
            txid: "txid3",
            outputIndex: 1,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address2",
            amount: 50,
            index: 0,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 100 from 'address4' to 'address3' spending 'address4's output from txid2
        txid: "txid6",
        inputs: [
          {
            txid: "txid2",
            outputIndex: 1,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address3",
            amount: 100,
            index: 0,
          },
        ],
        timestamp: Date.now(),
      },
    ];
  });

  describe("Utility functions", () => {
    it("can mine genesis blocks", () => {
      const minerAddress = "asdfasdfasdfasdf";
      const genesis = mineGenesisBlock(minerAddress, 3);
      expect(genesis.hash.startsWith("000"));
      expect(genesis.prevHash).toBe("0");
      expect(genesis.txs).toHaveLength(1);
      expect(genesis.minerAddress).toEqual(minerAddress);
      expect(genesis.difficulty).toBe(3);

      expect(genesis.txs[0].inputs).toHaveLength(0);
      expect(genesis.txs[0].outputs).toHaveLength(1);
      expect(genesis.txs[0].outputs[0].address).toEqual(minerAddress);
      expect(genesis.txs[0].outputs[0].amount).toEqual(100);

      const data =
        genesis.prevHash +
        genesis.timestamp +
        JSON.stringify(genesis.txs) +
        genesis.minerAddress +
        genesis.nonce;

      const hash = sha256(data).toString();
      expect(genesis.hash).toBe(hash);
    });

    it("can mine blocks", () => {
      const genesis: Block = {
        hash: "genesisHash",
        prevHash: "0",
        minerAddress: "genesisMiner",
        difficulty: 3,
        txs: [],
        nonce: 1,
        timestamp: 1,
      };

      const block = mineBlock(genesis, [], "minerAddress");
      expect(block.hash.startsWith("000"));
      expect(block.prevHash).toBe("genesisHash");
      expect(block.txs).toHaveLength(1);
      expect(block.minerAddress).toEqual("minerAddress");
      expect(block.difficulty).toBe(genesis.difficulty);

      expect(block.txs[0].inputs).toHaveLength(0);
      expect(block.txs[0].outputs).toHaveLength(1);
      expect(block.txs[0].outputs[0].address).toEqual("minerAddress");
      expect(block.txs[0].outputs[0].amount).toEqual(100);

      const data =
        block.prevHash +
        block.timestamp +
        JSON.stringify(block.txs) +
        block.minerAddress +
        block.nonce;

      const hash = sha256(data).toString();
      expect(block.hash).toBe(hash);
    });

    it("can mine blocks with transactions", () => {
      const genesis: Block = {
        hash: "genesisHash",
        prevHash: "0",
        minerAddress: "genesisMiner",
        difficulty: 3,
        txs: [],
        nonce: 0,
        timestamp: Date.now(),
      };

      const block = mineBlock(genesis, transactions, "minerAddress");
      expect(block.hash.startsWith("000"));
      expect(block.prevHash).toBe("genesisHash");
      expect(block.txs.slice(0, block.txs.length - 1)).toEqual(transactions);
      const rewardTx = block.txs[block.txs.length - 1];
      expect(rewardTx.inputs).toHaveLength(0);
      expect(rewardTx.outputs).toHaveLength(1);
      expect(rewardTx.outputs[0]).toEqual({
        address: "minerAddress",
        amount: 100,
        index: 0,
      });
      expect(block.minerAddress).toEqual("minerAddress");
      expect(block.difficulty).toBe(genesis.difficulty);

      const data =
        block.prevHash +
        block.timestamp +
        JSON.stringify(block.txs) +
        block.minerAddress +
        block.nonce;

      const hash = sha256(data).toString();
      expect(block.hash).toBe(hash);
    });

    describe("given a list of blocks", () => {
      it("can get a list of transactions", () => {
        const res = getTransactions(blocks);
        expect(res).toEqual(transactions);
      });

      it("can get a map of txids to unspent transaction outputs", () => {
        const utxoMap = getUTXO(blocks);
        expect(utxoMap.get("txid1")).not.toBe(undefined);
        expect(utxoMap.get("txid1")).toHaveLength(1);

        const utxo1 = utxoMap.get("txid1");
        expect(utxo1).not.toBe(undefined);
        if (utxo1) {
          expect(utxo1).toHaveLength(1);
          expect(utxo1[0]).toEqual({
            address: "address2",
            amount: 100,
            index: 1,
          });
        }

        const utxo2 = utxoMap.get("txid2");
        expect(utxo2).not.toBe(undefined);
        if (utxo2) {
          expect(utxo2).toHaveLength(1);
          expect(utxo2[0]).toEqual({
            address: "address4",
            amount: 100,
            index: 1,
          });
        }

        const utxo3 = utxoMap.get("txid3");
        expect(utxo3).not.toBe(undefined);
        if (utxo3) {
          expect(utxo3).toHaveLength(2);
          expect(utxo3[0]).toEqual({
            address: "address2",
            amount: 50,
            index: 0,
          });
          expect(utxo3[1]).toEqual({
            address: "address1",
            amount: 50,
            index: 1,
          });
        }

        const utxo4 = utxoMap.get("txid4");
        expect(utxo4).not.toBe(undefined);
        if (utxo4) {
          expect(utxo4).toHaveLength(2);
          expect(utxo4[0]).toEqual({
            address: "address4",
            amount: 50,
            index: 0,
          });
          expect(utxo4[1]).toEqual({
            address: "address3",
            amount: 50,
            index: 1,
          });
        }
      });

      it("can get a map of addresses to confirmed balances", () => {
        const balances = getAddressBalances(blocks);
        const address1Balance = balances.get("address1");
        expect(address1Balance).toBe(50);
        const address2Balance = balances.get("address2");
        expect(address2Balance).toBe(150);
        const address3Balance = balances.get("address3");
        expect(address3Balance).toBe(50);
        const address4Balance = balances.get("address4");
        expect(address4Balance).toBe(150);
      });

      it("can get a map of addresses to unconfirmed balances when also given a list of unconfirmed transactions", () => {
        const unconfirmedBalances = getAddressUnconfirmedBalances(
          blocks,
          unconfirmedTxs
        );

        const address1Balance = unconfirmedBalances.get("address1");
        expect(address1Balance).toBe(-50);
        const address2Balance = unconfirmedBalances.get("address2");
        expect(address2Balance).toBe(50);
        const address3Balance = unconfirmedBalances.get("address3");
        expect(address3Balance).toBe(100);
        const address4Balance = unconfirmedBalances.get("address4");
        expect(address4Balance).toBe(-100);
      });
    });
  });

  describe("Wallet class", () => {
    it("Can create transactions", () => {
      const wallet = new Wallet();

      // replace 'address1' with wallet address in test data
      blocks = blocks.map((block) => ({
        ...block,
        txs: block.txs.map((tx) => ({
          ...tx,
          outputs: tx.outputs.map((output) =>
            output.address === "address1"
              ? { ...output, address: wallet.address }
              : output
          ),
        })),
      }));

      const tx = wallet.createTransaction("address2", 40, blocks);
      expect(tx).not.toBeNull();
      if (tx) {
        expect(tx.inputs).toHaveLength(1);
        expect(tx.inputs[0].txid).toBe("txid3");
        expect(tx.inputs[0].outputIndex).toBe(1);
        expect(tx.outputs).toHaveLength(2);
        expect(tx.outputs[0]).toEqual({
          address: "address2",
          amount: 40,
          index: 0,
        });
        expect(tx.outputs[1]).toEqual({
          address: wallet.address,
          amount: 10,
          index: 1,
        });
      }
    });
  });
});
