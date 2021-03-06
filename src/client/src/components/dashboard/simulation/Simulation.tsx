import React, { useCallback, useEffect, useRef, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import * as Blockchain from "../../../../../lib/blockchain";
import SimulationControl from "./SimulationControl";
import NodePanel from "./NodePanel";
import TransactionPanel from "../shared/TransactionPanel";
import BlockPanel from "../shared/BlockPanel";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";

const INTERVAL_TIME = 1000;

function Simulation() {
  const [running, setRunning] = useState(false);
  const [autoTx, setAutoTx] = useState(false);
  const [nodes, setNodes] = useState(new Map<string, Blockchain.Wallet>());
  const [nodeWallets, setNodeWallets] = useState<Blockchain.Wallet[]>([]);
  const blocksRef = useRef<Blockchain.Block[]>([]);
  const [blocks, setBlocks] = useState<Blockchain.Block[]>([]);
  const [transactions, setTransactions] = useState<Blockchain.Transaction[]>(
    []
  );
  const txRef = useRef<Blockchain.Transaction[]>([]);
  const miningInterval = useRef<NodeJS.Timeout>();
  const txInterval = useRef<NodeJS.Timeout>();
  const balancesRef = useRef<{
    confirmed: Map<string, number>;
    unconfirmed: Map<string, number>;
  }>({
    confirmed: new Map<string, number>(),
    unconfirmed: new Map<string, number>(),
  });
  const [balances, setBalances] = useState(balancesRef.current);
  const [difficulty, setDifficulty] = useState(1);

  const createSimulation = (noOfNodes: number, miningDifficulty: number) => {
    const wallets = [];
    const nodeMap = new Map<string, Blockchain.Wallet>();
    setBlocks([]);
    for (let i = 0; i < noOfNodes; i += 1) {
      const wallet = new Blockchain.Wallet();
      wallets.push(wallet);
      nodeMap.set(`Node ${i + 1}`, wallet);
    }
    setNodes(nodeMap);
    setNodeWallets(wallets);
    txRef.current = [];
    setTransactions(txRef.current);
    blocksRef.current = [];
    setBlocks(blocksRef.current);
    setDifficulty(miningDifficulty);
  };

  const updateConfirmedBalances = useCallback(() => {
    balancesRef.current = {
      ...balancesRef.current,
      confirmed: Blockchain.getAddressBalances(blocksRef.current),
    };
    setBalances(balancesRef.current);
  }, []);

  const updateUnconfirmedBalances = useCallback(() => {
    balancesRef.current = {
      ...balancesRef.current,
      unconfirmed: Blockchain.getAddressUnconfirmedBalances(
        blocksRef.current,
        txRef.current
      ),
    };
    setBalances(balancesRef.current);
  }, []);

  const mineBlock = useCallback(
    (minerAddress: string) => {
      let block: Blockchain.Block;
      if (blocksRef.current.length === 0) {
        block = Blockchain.mineGenesisBlock(minerAddress, difficulty);
      } else {
        block = Blockchain.mineBlock(
          blocksRef.current[blocksRef.current.length - 1],
          txRef.current,
          minerAddress
        );
        txRef.current = [];
        setTransactions(txRef.current);
      }
      blocksRef.current = [...blocksRef.current, block];
      setBlocks(blocksRef.current);
      updateConfirmedBalances();
      updateUnconfirmedBalances();
    },
    [difficulty]
  );

  const getRandomNode = useCallback(
    () => nodeWallets[Math.floor(Math.random() * nodeWallets.length)],
    [nodeWallets]
  );

  const getRandomNodeWithBalance = useCallback(() => {
    const walletsWithBalance = nodeWallets.filter((w) =>
      balancesRef.current.confirmed.has(w.address)
    );
    return walletsWithBalance.length > 0
      ? walletsWithBalance[
          Math.floor(Math.random() * walletsWithBalance.length)
        ]
      : null;
  }, [nodeWallets]);

  const createTransaction = useCallback(
    (fromWallet: Blockchain.Wallet, toAddress: string, amount: number) => {
      const unconfirmedBalance = balancesRef.current.unconfirmed.has(
        fromWallet.address
      )
        ? balancesRef.current.unconfirmed.get(fromWallet.address)
        : 0;
      const balance = balancesRef.current.confirmed.has(fromWallet.address)
        ? balancesRef.current.confirmed.get(fromWallet.address)
        : 0;
      if (
        typeof unconfirmedBalance !== "undefined" &&
        typeof balance !== "undefined"
      ) {
        const tx = fromWallet.createTransaction(
          toAddress,
          amount,
          blocksRef.current
        );
        if (tx) {
          txRef.current = [...txRef.current, tx];
          setTransactions(txRef.current);
          updateUnconfirmedBalances();
          return true;
        }
      }
      return false;
    },
    []
  );

  const createRandomTransaction = useCallback(() => {
    const fromWallet = getRandomNodeWithBalance();

    const toWallet = getRandomNode();
    if (fromWallet !== null && toWallet !== null) {
      const balance = balancesRef.current.confirmed.get(fromWallet.address);
      if (typeof balance !== "undefined") {
        const amount = Math.floor(Math.random() * balance) + 1;
        createTransaction(fromWallet, toWallet.address, amount);
        setTransactions(txRef.current);
        updateUnconfirmedBalances();
      }
    }
  }, [nodeWallets]);

  useEffect(() => {
    if (running) {
      miningInterval.current = setInterval(() => {
        if (autoTx) {
          if (typeof txInterval.current !== "undefined") {
            clearInterval(txInterval.current); // stop previous tx Interval before starting new one
          }
          const noOfTxs = Math.floor(Math.random() * 10) + 1;
          const TxTime = INTERVAL_TIME / noOfTxs + 1;
          txInterval.current = setInterval(() => {
            createRandomTransaction();
          }, TxTime);
        }
        const minerWallet = getRandomNode();
        if (minerWallet) {
          mineBlock(minerWallet.address);
        }
      }, INTERVAL_TIME);
    } else {
      // clear intervals
      if (typeof miningInterval.current !== "undefined") {
        clearTimeout(miningInterval.current);
        miningInterval.current = undefined;
      }
      if (typeof txInterval.current !== "undefined") {
        clearInterval(txInterval.current);
        txInterval.current = undefined;
      }
    }
  }, [running]);

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
                  <NodePanel
                    nodes={nodes}
                    balances={balances.confirmed}
                    unconfirmedBalances={balances.unconfirmed}
                    mineBlock={mineBlock}
                    createTransaction={createTransaction}
                    running={running}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TransactionPanel transactions={transactions} />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Divider style={{ margin: 10 }} />
                  <BlockPanel blocks={blocks} mine={false} />
                </Grid.Col>
              </Grid>
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
                confirmed={Blockchain.getTransactions(blocks)}
                unconfirmed={transactions}
              />
            }
          />
          <Route
            path=":txid"
            element={
              <Transactions
                confirmed={Blockchain.getTransactions(blocks)}
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
