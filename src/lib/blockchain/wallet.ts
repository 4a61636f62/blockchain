import { ec as EC } from "elliptic";
import RIPEMD160 from "crypto-js/ripemd160";
import { lib } from "crypto-js/core";

import {
  Block,
  Transaction,
  TransactionInput,
  TransactionOutput,
} from "./types";
import * as Blockchain from "./index";

const ec = new EC("secp256k1");

export class Wallet {
  private readonly keypair: EC.KeyPair;

  readonly address: string;

  constructor() {
    const privateKey = lib.WordArray.random(32).toString();
    this.keypair = ec.keyFromPrivate(privateKey);
    const publicKey =
      this.keypair.getPublic().getX().toString(16) +
      (this.keypair.getPublic().getY().isOdd() ? "1" : "0");
    this.address = RIPEMD160(publicKey).toString();
  }

  public createTransaction(
    outputAddress: string,
    amountToSend: number,
    blocks: Block[]
  ): Transaction | null {
    const utxo = Blockchain.getUTXO(blocks);

    const [inputs, change] = this.getInputsForTransaction(amountToSend, utxo);
    if (change < 0) return null;

    const outputs: TransactionOutput[] = [];
    outputs.push({ address: outputAddress, amount: amountToSend, index: 0 });
    if (change > 0)
      outputs.push({ address: this.address, amount: change, index: 1 });

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
    utxo: Map<string, TransactionOutput[]>
  ): [TransactionInput[], number] {
    let total = 0;
    const inputs: TransactionInput[] = [];

    Array.from(utxo.entries()).some(([txid, outputs]) =>
      outputs.some((output, index) => {
        if (output.address === this.address) {
          inputs.push({
            txid,
            outputIndex: output.index,
            signature: this.sign(txid + index),
          });
          total += output.amount;
        }
        return total >= amount;
      })
    );
    return [inputs, total - amount];
  }

  private sign(data: string): {
    r: string;
    s: string;
    recoveryParam: number | null;
  } {
    const sig = this.keypair.sign(data);
    return {
      r: sig.r.toString(),
      s: sig.s.toString(),
      recoveryParam: sig.recoveryParam,
    };
  }
}
