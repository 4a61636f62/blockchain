import {Block} from "./block";

export class Blockchain {
    private readonly _chain: Block[] = []

    get chain(): Block[] {
        return this._chain
    }

    get lastBlock(): Block {
        return this._chain[this._chain.length - 1]
    }

    addBlock(block: Block) {
        this._chain.push(block)
    }
}