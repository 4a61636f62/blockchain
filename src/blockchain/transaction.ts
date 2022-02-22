import {blockchainAddress} from "./wallet";

type txid = string

export type Transaction = {
    txid: txid
    inputs: TransactionInput[]
    outputs: TransactionOutput[]
}

export type TransactionInput = {
    txid: txid
    outputIndex: number
    signature: {
        r: string,
        s: string
    }

}

export type TransactionOutput = {
    amount: number
    address: blockchainAddress
}
