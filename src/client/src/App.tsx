import React, {useCallback, useEffect, useState} from 'react';
import {Message, MessageTypes} from "../../lib/message";
import {Node} from "../../blockchain/blockchain-node";
import {Block} from "../../blockchain/block";
import {Blocks} from "./components/Blocks";
import {BlockchainClient} from "./blockchain-client";

const client = new BlockchainClient()

function App() {
    const [blocks, setBlocks] = useState<Block[]>([])
    const [mining, setMining] = useState(false)

    const handleBlockAnnouncement = useCallback((message: Message) => {
        console.log(message)
        const block = message.payload as Block
        block.hash = message.payload._hash
        block.nonce = message.payload._nonce
        addBlock(block)
    }, [blocks])

    const handleMessages = useCallback((message: Message) => {
        switch (message.type) {
            case MessageTypes.NewBlockAnnouncement: return handleBlockAnnouncement(message)
        }
    }, [])


    useEffect(() => {
        // Request the longest chain from server or start a new chain
        (async () => {
            console.log("attempting to connect")
            await client.connect(handleMessages)
            console.log("connected")
        })()
    }, [])

    async function mine() {
        if (mining) {
            return
        }
        setMining(true)
        let block: Block
        if (blocks.length == 0) {
            block = await Node.mineGenesisBlock()
        } else {
            block = await Node.mineBlock(blocks[blocks.length-1], [])
        }
        addBlock(block)
        setMining(false)
        client.announceBlock(block)
    }

    function addBlock(block: Block) {
        setBlocks(blocks => [...blocks, block])
    }


    return (
        <div className="Blockchain">
            <button disabled={mining}
                    onClick={mine}
            >
                Mine!
            </button>
            <Blocks blocks={blocks} />
        </div>
    );
}

export default App;