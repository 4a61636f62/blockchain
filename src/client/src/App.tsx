import React, {useEffect, useState} from 'react';
import {Message, MessageTypes} from "../../lib/message";
import {Node} from "../../blockchain/blockchain-node";
import {Block} from "../../blockchain/block";
import {Blocks} from "./components/Blocks";
import {BlockchainClient} from "./blockchain-client";

const client = new BlockchainClient()

function App() {
    const [blocks, setBlocks] = useState<Block[]>([])
    const [mining, setMining] = useState(false)

    const handleBlockAnnouncement = (message: Message) => {
        console.log(message)
        const block = message.payload as Block
        block.hash = message.payload._hash
        block.nonce = message.payload._nonce
        if (Node.validateBlock(block, blocks[blocks.length-1].hash)) {
            addBlock(block)
        }
    }

    const handleChainResponse = (message: Message) => {
        console.log(message)
        if (message.payload.length == 0) {
            mine().then()
            return
        }
        for (const obj of message.payload) {
            const block = obj as Block
            block.hash = obj._hash
            block.nonce = obj._nonce
            addBlock(block)
        }
    }

    const handleChainRequest = (message: Message) => {
        console.log(message)
        console.log(blocks)
        client.sendChain(blocks)
    }

    const handleMessages = (message: Message) => {
        switch (message.type) {
            case MessageTypes.NewBlockAnnouncement: return handleBlockAnnouncement(message)
            case MessageTypes.ChainResponse: return handleChainResponse(message)
            case MessageTypes.ChainRequest: return handleChainRequest(message)
        }
    }


    useEffect(() => {
        // Request the longest chain from server or start a new chain
        (async () => {
            await client.connect()
            console.log("connected to blockchain server")
            client.requestLongestChain()
        })()
    }, [])

    useEffect(() => {
        // update callback method when blocks change
        client.setMessagesCallback(handleMessages)
    }, [blocks])

    async function mine() {
        if (mining) {
            return
        }
        setMining(true)
        let block: Block
        if (blocks.length == 0) {
            console.log("mining genesis block")
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
            <button onClick={() => console.log(blocks)}>
                blocks
            </button>
            <Blocks blocks={blocks} />
        </div>
    );
}

export default App;