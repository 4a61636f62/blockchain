import { ec as EC } from "elliptic";
import RIPEMD160 from "crypto-js/ripemd160";
import { lib } from "crypto-js/core";

import * as Blockchain from "./utils";

const ec = new EC("secp256k1");

export type BlockchainAddress = string;

export class Wallet {
  private readonly privateKey: string;

  private readonly keypair: EC.KeyPair;

  readonly publicKey: string;

  readonly address: BlockchainAddress;

  constructor() {
    this.privateKey = lib.WordArray.random(32).toString();
    this.keypair = ec.keyFromPrivate(this.privateKey);
    this.publicKey =
      this.keypair.getPublic().getX().toString(16) +
      (this.keypair.getPublic().getY().isOdd() ? "1" : "0");
    this.address = RIPEMD160(this.publicKey).toString();
  }

  public createTransaction(
    outputAddress: BlockchainAddress,
    amountToSend: number,
    blocks: Blockchain.Block[],
    balance: number,
    unconfirmedBalance: number
  ): Blockchain.Transaction | null {
    const utxo = Blockchain.getUTXO(blocks);
    if (balance + unconfirmedBalance < amountToSend) {
      return null;
    }

    const [inputs, change] = this.getInputsForTransaction(amountToSend, utxo);
    if (change < 0) {
      return null;
    }

    const outputs: Blockchain.TransactionOutput[] = [
      {
        address: outputAddress,
        amount: amountToSend,
      },
    ];

    if (change > 0) {
      outputs.push({
        address: this.address,
        amount: change,
      });
    }

    const timestamp = Date.now();
    return {
      inputs,
      outputs,
      txid: Blockchain.createTXID(inputs, outputs, timestamp),
      timestamp,
    };
  }

  private getInputsForTransaction(
    amount: number,
    utxo: Map<string, Blockchain.TransactionOutput[]>
  ): [Blockchain.TransactionInput[], number] {
    let total = 0;
    const inputs: Blockchain.TransactionInput[] = [];

    Array.from(utxo.entries()).some(([txid, outputs]) =>
      outputs.some((output, index) => {
        if (output.address === this.address) {
          inputs.push({
            txid,
            outputIndex: index,
            signature: this.sign(txid + index),
          });
          total += output.amount;
        }
        return total >= amount;
      })
    );
    return [inputs, total - amount];
  }

  private sign(data: string): { r: string; s: string } {
    const sig = this.keypair.sign(data);
    return {
      r: sig.r.toString(),
      s: sig.s.toString(),
    };
  }
}
