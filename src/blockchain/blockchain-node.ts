import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import {Block} from "./block";
import {Transaction, TransactionInput, TransactionOutput} from "./transaction";
import {blockchainAddress} from "./wallet";

const HASH_REQUIREMENT = '0000';

export abstract class Node {

    static async mineGenesisBlock(minerAddress: blockchainAddress): Promise<Block> {
        return await Node.mine(new Block('0', Date.now(), [this.createBlockReward(minerAddress)], minerAddress))
    }

    static async mineBlock(prevBlock: Block, txs: Transaction[], minerAddress: blockchainAddress): Promise<Block> {
        const block = new Block(prevBlock.hash, Date.now(),
            [...txs, this.createBlockReward(minerAddress)], minerAddress)
        await Node.mine(block)
        return block
    }

    static validateBlock(block: Block, prevHash: string): boolean {
        return (this.hashBlock(block, block.nonce) === block.hash && block.prevHash === prevHash)
    }

    static hashBlock(block: Block, nonce: number): string {
        const data = block.prevHash + block.timestamp + JSON.stringify(block.txs) + nonce + block.minerAddress
        return sha256(data).toString(Hex)
    }

    static createTXID(inputs: TransactionInput[], outputs: TransactionOutput[], timestamp: number): string {
        return sha256(inputs.toString() + outputs.toString() + timestamp).toString()
    }

    static getUTXO(blocks: Block[]): Map<string,TransactionOutput[]> {
        const txs = this.getTransactions(blocks)
        const utxoMap = new Map<string, TransactionOutput[]>()

        for (let tx of txs) {
            utxoMap.set(tx.txid, tx.outputs)
            for (let input of tx.inputs) {
                let outputs = utxoMap.get(input.txid)
                if (typeof outputs !== 'undefined') {
                    outputs.splice(input.outputIndex, 1)
                    if (outputs.length == 0) {
                        utxoMap.delete(input.txid)
                    }
                }
            }
        }

        return utxoMap
    }

    static getAddressBalances(blocks: Block[]): Map<blockchainAddress, number> {
        const utxo = Array.from(this.getUTXO(blocks).values()).flat()
        const map = new Map<blockchainAddress, number>()
        for (let output of utxo) {
            const balance = map.get(output.address) || 0
            map.set(output.address, balance + output.amount)
        }
        return map
    }

    static getTransactions(blocks: Block[]): Transaction[] {
        const txs: Transaction[] = []
        for (let block of blocks) {
            txs.push(...block.txs)
        }
        return txs
    }

    private static async mine(block: Block): Promise<Block> {
        let hash = ''
        let nonce = 0

        do {
            ++nonce
            hash = Node.hashBlock(block, nonce)
        } while (!hash.startsWith(HASH_REQUIREMENT))

        block.hash = hash
        block.nonce = nonce
        return block
    }

    private static createBlockReward(minerAddress: blockchainAddress): Transaction {
        const blockRewardOutput: TransactionOutput = {address: minerAddress, amount: 100}
        const timestamp = Date.now()
        return ({
            inputs: [],
            outputs: [blockRewardOutput],
            txid: this.createTXID([], [blockRewardOutput], timestamp),
            timestamp
        })
    }
}