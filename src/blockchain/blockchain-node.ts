// import { hash, uuid } from '../lib/crypto'
import sha256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'
import {Tx} from "./tx";
import {Block} from "./block";
import {Blockchain} from "./blockchain";

const HASH_REQUIREMENT = '0000';

export class Node {
    chain: Blockchain
    private txPool: Tx[] = []

    constructor() {
        this.chain = new Blockchain()
    }


    async startChain(): Promise<void> {
        const genesis = await Node.mineBlock(new Block('0', Date.now(), []))
        this.chain.addBlock(genesis)
    }

    loadChain(chain: Blockchain): void {
        this.chain = chain
    }

    async createBlock(): Promise<Block> {
        const block = new Block(this.chain.lastBlock.hash, Date.now(), this.txPool)
        await Node.mineBlock(block)
        this.chain.addBlock(block)
        return block
    }

    addToTxPool(...txs: Tx[]) {
        this.txPool.push(...txs)
    }

    static async mineBlock(block: Block): Promise<Block> {
        let hash = ''
        let nonce = 0

        do {
            hash = Node.hashBlock(block, nonce)
            ++nonce
        } while (!hash.startsWith(HASH_REQUIREMENT))

        block.hash = hash
        block.nonce = nonce
        return block
    }

    static hashBlock(block: Block, nonce: number): string {
        const data = block.prevHash + block.timestamp + JSON.stringify(block.txs) + nonce
        return sha256(data).toString(Hex)
    }
}