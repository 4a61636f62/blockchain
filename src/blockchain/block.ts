import {Tx} from './tx'

export class Block {
    private _nonce: number = 0
    private  _hash: string = ''

    constructor(
        readonly prevHash: string,
        readonly timestamp: number,
        readonly txs : Tx[]
    ) {}

    get hash(): string {
        return this._hash
    }

    set hash(hash: string) {
        this._hash = hash
    }

    get nonce(): number {
        return this._nonce
    }

    set nonce(nonce: number) {
        this._nonce = nonce
    }

    get isMined(): boolean {
        return (!!this.nonce)
    }
}