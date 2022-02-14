import React, {useState} from 'react';
import {Node} from "../../blockchain/blockchain-node";
import {Block} from "../../blockchain/block";
import {Blocks} from "./components/Blocks";
import {useBlockchainClient} from "./BlockchainContext";

function App() {
    const [mining, setMining] = useState(false)
    const {state, dispatch} = useBlockchainClient()



    async function mine() {
        if (mining) {
            return
        }
        setMining(true)
        let block: Block
        if (state.blocks.length == 0) {
            console.log("mining genesis block")
            block = await Node.mineGenesisBlock()
        } else {
            block = await Node.mineBlock(state.blocks[state.blocks.length-1], [])
        }
        dispatch({type: 'add-block', block})
        dispatch({type: 'send-block-announcement', block})
        setMining(false)
    }

    return (
            <div className="Blockchain">
                <button disabled={mining}
                        onClick={mine}
                >
                    Mine!
                </button>
                <Blocks blocks={state.blocks} />
            </div>
    );
}

export default App;