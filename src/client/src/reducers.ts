import {State} from "./BlockchainContext";
import {Block} from "../../blockchain/block";
import {Transaction} from "../../blockchain/transaction";
import {Message} from "../../lib/message";
import {Node} from "../../blockchain/blockchain-node";

export const addBlock = (state: State, block: Block): State => {
    state.blocks.push(block)
    state.transactions = removeConfirmedTransactions(state.transactions, block)
    return state
}

export const addTransaction = (state: State, transaction: Transaction): State => {
    state.transactions.push(transaction)
    return state
}

export const handleBlockAnnouncement = (state: State, message: Message): State => {
    const block = message.payload as Block
    block.hash = message.payload._hash
    block.nonce = message.payload._nonce
    if (state.blocks.length < 1 || Node.validateBlock(block, state.blocks[state.blocks.length-1].hash)) {
        return addBlock(state, block)
    }
    return state
}

export const handleTransactionAnnouncement = (state: State, message: Message): State => {
    const transaction = message.payload as Transaction
    return addTransaction(state, transaction)
}

export const handleChainResponse = (state: State, message: Message): State => {
    state.blocks = []
    for (const obj of message.payload) {
        const block = obj as Block
        block.hash = obj._hash
        block.nonce = obj._nonce
        state.blocks.push(block)
    }
    return state
}

const removeConfirmedTransactions = (transactions: Transaction[], block: Block): Transaction[] => {
    return transactions.filter((t) => {
        for (let tx of block.txs) {
            if (t.txid == tx.txid) {
                return false
            }
        }
        return true
    })
}