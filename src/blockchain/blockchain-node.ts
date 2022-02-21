import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import {Tx} from "./tx";
import {Block} from "./block";

const HASH_REQUIREMENT = '0000';

export abstract class Node {

    static async mineGenesisBlock(minerAddress: string): Promise<Block> {
        return await Node.mine(new Block('0', Date.now(), [], minerAddress))
    }

    static async mineBlock(prevBlock: Block, txs: Tx[], minerAddress: string): Promise<Block> {
        const block = new Block(prevBlock.hash, Date.now(), txs, minerAddress)
        await Node.mine(block)
        return block
    }

    static validateBlock(block: Block, prevHash: string): boolean {
        return (this.hashBlock(block, block.nonce) === block.hash && block.prevHash === prevHash)
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

    static hashBlock(block: Block, nonce: number): string {
        const data = block.prevHash + block.timestamp + JSON.stringify(block.txs) + nonce + block.minerAddress
        return sha256(data).toString(Hex)
    }
}