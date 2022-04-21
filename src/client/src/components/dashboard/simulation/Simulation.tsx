import React, { useEffect, useMemo, useRef, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import { Wallet } from "lib/wallet";
import { BlockchainUtils } from "lib/blockchain-utils";
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
  const [nodes, setNodes] = useState(new Map<string, Wallet>());
  const [nodeWallets, setNodeWallets] = useState<Wallet[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const txRef = useRef<Transaction[]>([]);
  const miningTimeout = useRef<NodeJS.Timeout>();
  const txTimeout = useRef<NodeJS.Timeout>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createSimulation = (noOfNodes: number, miningDifficulty: number) => {
    const wallets = [];
    const nodeMap = new Map<string, Wallet>();
    setBlocks([]);
    for (let i = 0; i < noOfNodes; i += 1) {
      const wallet = new Wallet();
      wallets.push(wallet);
      nodeMap.set(`Node ${i + 1}`, wallet);
    }
    setNodes(nodeMap);
    setNodeWallets(wallets);
    txRef.current = [];
    setTransactions(txRef.current);
  };

  const mineBlock = useMemo(
    () => (minerAddress: string) => {
      let block: Block;
      if (blocks.length === 0) {
        block = BlockchainUtils.mineGenesisBlock(minerAddress);
      } else {
        const txs = [...txRef.current];
        txRef.current = [];
        setTransactions(txRef.current);
        block = BlockchainUtils.mineBlock(
          blocks[blocks.length - 1],
          txs,
          minerAddress
        );
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
        return true;
      }
      return false;
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
                  <Nodes
                    nodes={nodes}
                    blocks={blocks}
                    transactions={transactions}
                    mineBlock={mineBlock}
                    createTransaction={createTransaction}
                    running={running}
                  />
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
        <Route path="blocks">
          <Route index element={<Blocks blocks={blocks} />} />
          <Route path=":hash" element={<Blocks blocks={blocks} />} />
        </Route>
        <Route path="transactions">
          <Route
            index
            element={
              <Transactions
                confirmed={BlockchainUtils.getTransactions(blocks)}
                unconfirmed={transactions}
              />
            }
          />
          <Route
            path=":txid"
            element={
              <Transactions
                confirmed={BlockchainUtils.getTransactions(blocks)}
                unconfirmed={transactions}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default Simulation;
