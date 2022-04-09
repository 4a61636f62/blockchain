import React, { useEffect, useRef, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import { Wallet } from "lib/wallet";
import { Node } from "lib/blockchain-node";
import { Block } from "lib/blockchain";
import SimulationControl from "./SimulationControl";
import Nodes from "../Nodes";
import UnconfirmedTransactions from "../UnconfirmedTransactions";
import BlockChain from "../Blockchain";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";

function Simulation() {
  const [running, setRunning] = useState(false);
  const [nodeWallets, setNodeWallets] = useState<Wallet[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const timeout = useRef<NodeJS.Timeout>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createSimulation = (noOfNodes: number, miningDifficulty: number) => {
    const wallets = [];
    for (let i = 0; i < noOfNodes; i += 1) {
      wallets.push(new Wallet());
    }
    setNodeWallets(wallets);
  };

  const mineBlock = (minerAddress: string) => {
    const block =
      blocks.length === 0
        ? Node.mineGenesisBlock(minerAddress)
        : Node.mineBlock(blocks[blocks.length - 1], [], minerAddress);
    setBlocks([...blocks, block]);
  };

  useEffect(() => {
    if (running) {
      timeout.current = setTimeout(() => {
        mineBlock(
          nodeWallets[Math.floor(Math.random() * nodeWallets.length)].address
        );
      }, 1000);
    } else if (typeof timeout.current !== "undefined") {
      clearTimeout(timeout.current);
    }
  }, [running, blocks]);

  return (
    <Routes>
      <Route path="/">
        <Route
          index
          element={
            <>
              <SimulationControl
                running={running}
                setRunning={setRunning}
                createSimulation={createSimulation}
                canStart={nodeWallets.length > 0}
              />
              <Divider style={{ margin: 10 }} />
              <Grid>
                <Divider />
                <Grid.Col span={6}>
                  <Nodes wallets={nodeWallets} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <UnconfirmedTransactions />
                </Grid.Col>
              </Grid>
              <Divider style={{ margin: 10 }} />
              <BlockChain blocks={blocks} />
            </>
          }
        />
        <Route path="blocks" element={<Blocks blocks={blocks} />} />
        <Route
          path="transactions"
          element={<Transactions transactions={[]} />}
        />
      </Route>
    </Routes>
  );
}

export default Simulation;
