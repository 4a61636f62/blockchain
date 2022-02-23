import React, { useState } from "react";
import { Button, Center, Grid } from "@mantine/core";
import { Node } from "lib/blockchain-node";
import { Block } from "lib/blockchain";
import { Blocks } from "client/src/components/Blocks";
import { useBlockchainClient } from "client/src/components/BlockchainContext";
import { Transactions } from "client/src/components/Transactions";
import { Wallet } from "client/src/components/Wallet";

function App() {
  const [mining, setMining] = useState(false);
  const { state, dispatch } = useBlockchainClient();

  async function mine() {
    if (mining) {
      return;
    }
    setMining(true);
    let block: Block;
    if (state.blocks.length === 0) {
      block = await Node.mineGenesisBlock(state.wallet.address);
    } else {
      block = await Node.mineBlock(
        state.blocks[state.blocks.length - 1],
        state.transactions,
        state.wallet.address
      );
    }
    dispatch({ type: "add-block", block });
    dispatch({ type: "send-block-announcement", block });
    setMining(false);
  }

  return (
    <div className="Blockchain">
      <Grid gutter="xl">
        <Grid.Col span={6} style={{ minHeight: 400 }}>
          <Center>
            <Button disabled={mining} onClick={() => mine()}>
              Mine!
            </Button>
          </Center>
        </Grid.Col>
        <Grid.Col span={6}>
          <Wallet />
        </Grid.Col>
        <Grid.Col span={6} style={{ minHeight: 600 }}>
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
