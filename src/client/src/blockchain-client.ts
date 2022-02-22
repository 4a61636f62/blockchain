import {WsClient} from "./ws-client";
import {Message, MessageTypes} from "../../lib/message";
import {Block} from "../../blockchain/block";
import {Node} from "../../blockchain/blockchain-node";
import {Transaction} from "../../blockchain/transaction";

export class BlockchainClient extends WsClient<Message> {
    announceBlock(block: Block): void {
        this.send({
            type: MessageTypes.NewBlockAnnouncement,
            correlationId: '1',
            payload: block
        })
    }

    announceTransaction(transaction: Transaction): void {
        this.send({
            type: MessageTypes.TransactionAnnouncement,
            correlationId: '1',
            payload: transaction
        })
    }

    requestLongestChain(): void {
        this.send({
            type: MessageTypes.ChainRequest,
            correlationId: '1',
        })
    }

    sendChain(blocks: Block[]): void {
        this.send({
            type: MessageTypes.ChainResponse,
            correlationId: '1',
            payload: blocks
        })
    }

    addBlock(block: Block, blocks: Block[]): Block[] {
        blocks.push(block)
        return blocks
    }

    addTransaction(transaction: Transaction, transactions: Transaction[]): Transaction[] {
        transactions.push(transaction)
        return transactions
    }

    handleBlockAnnouncement(message: Message, blocks: Block[]): Block[] {
        const block = message.payload as Block
        block.hash = message.payload._hash
        block.nonce = message.payload._nonce
        if (blocks.length < 1 || Node.validateBlock(block, blocks[blocks.length-1].hash)) {
            blocks.push(block)
        }
        return blocks
    }

    handleTransactionAnnouncement(message: Message, transactions: Transaction[]): Transaction[] {
        const transaction = message.payload as Transaction
        transactions.push(transaction)
        return transactions
    }

    handleChainResponse(message: Message): Block[] {
        const blocks: Block[] = []
        for (const obj of message.payload) {
            const block = obj as Block
            block.hash = obj._hash
            block.nonce = obj._nonce
            blocks.push(block)
        }
        return blocks
    }
}
