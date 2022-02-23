import {ec as EC} from 'elliptic';
const ec = new EC('secp256k1')
import RIPEMD160 from 'crypto-js/ripemd160'
import {lib} from "crypto-js/core";
import {Transaction, TransactionInput, TransactionOutput} from "./transaction";
import {Node} from "./blockchain-node";
import {Block} from "./block";

export type blockchainAddress = string



export class Wallet {
    private readonly privateKey: string
    private readonly keypair: EC.KeyPair
    readonly publicKey: string
    readonly address: blockchainAddress

    constructor() {
        this.privateKey = lib.WordArray.random(32).toString()
        this.keypair = ec.keyFromPrivate(this.privateKey)
        this.publicKey = this.keypair.getPublic().getX().toString(16) +
                        (this.keypair.getPublic().getY().isOdd() ? "1" : "0")
        this.address = RIPEMD160(this.publicKey).toString()
    }

    public createTransaction(outputAddress: blockchainAddress, amountToSend: number, blocks: Block[]): Transaction | null {
        const utxo = Node.getUTXO(blocks)
        const [inputs, change] = this.getInputsForTransaction(amountToSend, utxo)
        if (change < 0) {
            return null
        }

        const outputs: TransactionOutput[] = [
            {
                address: outputAddress,
                amount: amountToSend
            }
        ]

        if (change > 0) {
            outputs.push(
                {
                    address: this.address,
                    amount: change
                }
            )
        }

        const timestamp = Date.now()
        return {
            inputs: inputs,
            outputs: outputs,
            txid: Node.createTXID(inputs, outputs, timestamp),
            timestamp
        }
    }

    public getBalance(blocks: Block[], unconfirmed: Transaction[]): [number, number] {
        let balance = 0
        let unconfirmedBalance = 0
        const utxoMap = Node.getUTXO(blocks)
        const utxo = Array.from(utxoMap.values()).flat()

        for (let output of utxo) {
            if (output.address == this.address) {
                balance += output.amount
            }
        }

        for (let tx of unconfirmed) {
            for (let input of tx.inputs) {
                const outputs = utxoMap.get(input.txid)
                if (typeof outputs !== 'undefined') {
                    for(let output of outputs) {
                        if (output.address == this.address) {
                            unconfirmedBalance -= output.amount
                        }
                    }
                }
            }
            for (let output of tx.outputs) {
                if (output.address == this.address) {
                    unconfirmedBalance += output.amount
                }
            }
        }
        return [balance, unconfirmedBalance]
    }

    public getUnconfirmedBalance(unconfirmed: Transaction[]): number {
        let balance = 0
        for (let tx of unconfirmed) {
            for (let output of tx.outputs) {
                if (output.address == this.address) {
                    balance += output.amount
                }
            }
        }
        return balance
    }

    private getInputsForTransaction(amount: number, utxo: Map<string,
                                    TransactionOutput[]>): [TransactionInput[], number] {

        let total = 0
        const inputs: TransactionInput[] = []
        for (const [txid, outputs] of utxo.entries()) {
            for (let [index, output] of outputs.entries()) {
                if (output.address == this.address) {
                    inputs.push({
                        txid: txid,
                        outputIndex: index,
                        signature: this.sign(txid + index)
                    })
                    total += output.amount
                    if (total >= amount) {
                        return [inputs, total-amount]
                    }
                }
            }
        }
        return [inputs, total-amount]
    }

    private sign(data: string): {r: string, s: string} {
        const sig = this.keypair.sign(data)
        return {
            r: sig.r.toString(),
            s: sig.s.toString()
        }
    }
}