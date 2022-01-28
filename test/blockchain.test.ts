import {Tx} from "../src/blockchain/tx";
import {Block} from "../src/blockchain/block";
import {Blockchain} from "../src/blockchain/blockchain";
import {Node} from "../src/blockchain/blockchain-node"

describe("blockchain", () => {
    let b: Block
    let c: Blockchain

    beforeEach(() => {
        b = new Block('0', Date.now(), [])
        c = new Blockchain()
    })

    test("New blocks can be added", () => {
        c.addBlock(b)
        expect(c.chain.length).toEqual(1)
        c.addBlock(b)
        c.addBlock(b)
        expect(c.chain.length).toEqual(3)
    })

    test("Correctly returns last block", () => {
        const b2 = new Block('1', Date.now(), [])
        c.addBlock(b2)
        expect(c.lastBlock).toBe(b2)
    })
})

describe("blockchain node", () => {
    let n : Node

    beforeEach(() => {
        n = new Node()
    })

    test("Can start a new chain", async () => {
        await n.startChain()
        expect(n.chain.chain.length).toEqual(1)
        expect(n.chain.lastBlock.prevHash).toEqual('0')
    })

    test("Can hash blocks", () => {
        const hash = Node.hashBlock(new Block('', Date.now(), []), 0)
        expect(hash).not.toBe('')
    })

    test("Can mine blocks", async () => {
        await n.startChain()
        const b = n.chain.lastBlock
        const b2 = await Node.mineBlock(new Block(b.hash, Date.now(), []))
        expect(b2.nonce).toBeGreaterThan(0)
    })

    test("Can create blocks", async () => {
        await n.startChain()
        const gen = n.chain.lastBlock

        const b = await n.createBlock()
        expect(b.prevHash).toEqual(gen.hash)
        expect(b.hash).not.toEqual('')
        expect(b.nonce).toBeGreaterThan(0)
        expect(n.chain.lastBlock.hash).toEqual(b.hash)

        const b2 = await n.createBlock()
        expect(b2.prevHash).toEqual(b.hash)
        expect(b2.hash).not.toEqual('')
        expect(b2.nonce).toBeGreaterThan(0)
        expect(n.chain.lastBlock.hash).toEqual(b2.hash)
    })

    test("Can load an existing chain", async () => {
        const chain = new Blockchain()

        const gen = await Node.mineBlock( new Block('', Date.now(), []))
        chain.addBlock(gen)

        const b1 = await Node.mineBlock(new Block(gen.hash, Date.now(), []))
        chain.addBlock(b1)

        const b2 = await Node.mineBlock(new Block(b1.hash, Date.now(), []))
        chain.addBlock(b2)

        const b3 = await Node.mineBlock(new Block(b2.hash, Date.now(), []))
        chain.addBlock(b3)

        n.loadChain(chain)
        expect(n.chain.chain.length).toEqual(4)
        expect(n.chain.lastBlock.hash).toEqual(b3.hash)
    })

    test("Transactions in pool are included in next block", async () => {
        const tx1: Tx = {fromAddress: 'from1', toAddress: 'to1', amount: 10}
        const tx2: Tx = {fromAddress: 'from2', toAddress: 'to2', amount: 20}
        const tx3: Tx = {fromAddress: 'from3', toAddress: 'to3', amount: 30}

        await n.startChain()
        n.addToTxPool(tx1, tx2, tx3)

        const b = await n.createBlock()
        expect(b.txs[0]).toBe(tx1)
        expect(b.txs[1]).toBe(tx2)
        expect(b.txs[2]).toBe(tx3)
    })
})

