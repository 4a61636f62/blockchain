import React from "react";
import {Block} from "../../../blockchain/block";

export const Blocks: React.FC<{blocks: Block[]}> = ({ blocks }) =>
    <div>
        <h2>Blocks</h2>
        <div>
            {blocks.map((b,i) =>
                <CBlock key={b.hash} index={i} block={b} />
            )}
        </div>
    </div>

const CBlock: React.FC<{index: number, block: Block}> = ({ index, block}) => {
    // format transactions and convert timestamp to local time
    return (
        <div>
            <div>
                <p>#{index}</p>
                <p>{block.timestamp}</p>
            </div>
            <div>
                <p>Prev Hash: {block.prevHash}</p>
                <p>Hash: {block.hash}</p>
            </div>
            {/*<div>*/}
            {/*    <span>Transactions: {block.txs}</span>*/}
            {/*</div>*/}
            <br/>
        </div>
    )
}
