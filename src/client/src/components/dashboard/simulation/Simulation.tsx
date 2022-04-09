import React, { useEffect, useMemo, useRef, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import { Wallet } from "lib/wallet";
import { Node } from "lib/blockchain-node";
import { Block, Transaction } from "lib/blockchain";
import SimulationControl from "./SimulationControl";
import Nodes from "../Nodes";
import UnconfirmedTransactions from "../UnconfirmedTransactions";
import BlockChain from "../Blockchain";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";

function Simulation() {
  const [running, setRunning] = useState(false);
  const [autoTx, setAutoTx] = useState(false);
  const [nodeWallets, setNodeWallets] = useState<Wallet[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const txRef = useRef<Transaction[]>([]);
  const miningTimeout = useRef<NodeJS.Timeout>();
  const txTimeout = useRef<NodeJS.Timeout>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createSimulation = (noOfNodes: number, miningDifficulty: number) => {
    const wallets = [];
    setBlocks([]);
    for (let i = 0; i < noOfNodes; i += 1) {
      wallets.push(new Wallet());
    }
    setNodeWallets(wallets);
  };

  const mineBlock = useMemo(
    () => (minerAddress: string) => {
      let block: Block;
      if (blocks.length === 0) {
        block = Node.mineGenesisBlock(minerAddress);
      } else {
        const txs = [...txRef.current];
        txRef.current = [];
        setTransactions(txRef.current);
        block = Node.mineBlock(blocks[blocks.length - 1], txs, minerAddress);
      }
      setBlocks([...blocks, block]);
    },
    [blocks]
  );

  const getRandomNode = useMemo(
    () => () => nodeWallets[Math.floor(Math.random() * nodeWallets.length)],
    [nodeWallets]
  );

  const createTransaction = useMemo(
    () => (fromWallet: Wallet, toAddress: string, amount: number) => {
      const tx = fromWallet.createTransaction(toAddress, amount, blocks);
      if (tx) {
        txRef.current = [...txRef.current, tx];
        setTransactions(txRef.current);
      }
    },
    [blocks]
  );

  useEffect(() => {
    if (running) {
      miningTimeout.current = setTimeout(() => {
        mineBlock(getRandomNode().address);
      }, 1000);
    } else if (typeof miningTimeout.current !== "undefined") {
      clearTimeout(miningTimeout.current);
    }
  }, [running, blocks]);

  useEffect(() => {
    if (running && autoTx) {
      txTimeout.current = setInterval(() => {
        // problem: timeout is started before setTransactions([]) is called in createTransaction
        const fromWallet = getRandomNode();
        const toAddress = getRandomNode().address;
        const amount = 0;
        createTransaction(fromWallet, toAddress, amount);
      }, 100);
    } else if (typeof txTimeout.current !== "undefined") {
      clearTimeout(txTimeout.current);
      txTimeout.current = undefined;
    }
  }, [running, autoTx]);

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
                autoTx={autoTx}
                setAutoTx={setAutoTx}
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
                  <UnconfirmedTransactions transactions={transactions} />
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
