import {ec as EC} from 'elliptic';
const ec = new EC('secp256k1')
import RIPEMD160 from 'crypto-js/ripemd160'
import {lib} from "crypto-js/core";

export class Wallet {
    private readonly privateKey: string
    readonly publicKey: string
    readonly address: string

    constructor() {
        this.privateKey = lib.WordArray.random(32).toString()
        const keypair = ec.keyFromPrivate(this.privateKey)
        this.publicKey = keypair.getPublic().getX().toString(16) +
                        (keypair.getPublic().getY().isOdd() ? "1" : "0")
        this.address = RIPEMD160(this.publicKey).toString()
    }
}