import React, {useState} from 'react';
import {Node} from "../../blockchain/blockchain-node";
import {Block} from "../../blockchain/block";
import {Blocks} from "./components/Blocks";
import {useBlockchainClient} from "./BlockchainContext";
import {Button, Center, Grid} from "@mantine/core"
import {Transactions} from "./components/Transactions";
import {Wallet} from "./components/Wallet";

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
            block = await Node.mineGenesisBlock(state.wallet.address)
        } else {
            block = await Node.mineBlock(state.blocks[state.blocks.length-1], state.transactions, state.wallet.address)
        }
        dispatch({type: 'add-block', block})
        dispatch({type: 'send-block-announcement', block})
        setMining(false)
    }

    return (
            <div className="Blockchain">
                <Grid gutter="xl">
                    <Grid.Col span={6} style={{minHeight: 400}}>
                        <Center>
                            <Button disabled={mining} onClick={mine}>
                                Mine!
                            </Button>
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Wallet />
                    </Grid.Col>
                    <Grid.Col span={6} style={{minHeight: 600}}>
                        <Blocks blocks={state.blocks} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Transactions transactions={state.transactions} />
                    </Grid.Col>
                </Grid>
            </div>
    );
}

export default App;