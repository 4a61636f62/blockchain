import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const TIMEOUT = 1000;

function Simulation() {
  const [running, setRunning] = useState(false);
  const [autoTx, setAutoTx] = useState(false);
  const [nodes, setNodes] = useState(new Map<string, Wallet>());
  const [nodeWallets, setNodeWallets] = useState<Wallet[]>([]);
  const blocksRef = useRef<Block[]>([]);
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
    blocksRef.current = [];
    setBlocks(blocksRef.current);
  };

  const mineBlock = useCallback(
    (minerAddress: string) => {
      let block: Block;
      if (blocksRef.current.length === 0) {
        block = BlockchainUtils.mineGenesisBlock(minerAddress);
      } else {
        block = BlockchainUtils.mineBlock(
          blocksRef.current[blocksRef.current.length - 1],
          txRef.current,
          minerAddress
        );
        txRef.current = [];
        setTransactions(txRef.current);
      }
      blocksRef.current = [...blocksRef.current, block];
      setBlocks(blocksRef.current);
    },
    [blocksRef]
  );

  const balances = useMemo(
    () => BlockchainUtils.getAddressBalances(blocksRef.current),
    [blocksRef.current]
  );

  const unconfirmedBalances = useMemo(
    () =>
      BlockchainUtils.getAddressUnconfirmedBalances(
        blocksRef.current,
        txRef.current
      ),
    [blocksRef.current, txRef.current]
  );

  const getRandomNode = useCallback(
    (withBalance: boolean = false) => {
      const wallets = withBalance
        ? nodeWallets.filter((w) => balances.has(w.address))
        : nodeWallets;
      return wallets.length > 0
        ? wallets[Math.floor(Math.random() * wallets.length)]
        : null;
    },
    [nodeWallets, balances, blocks]
  );

  const createTransaction = useMemo(
    () => (fromWallet: Wallet, toAddress: string, amount: number) => {
      const unconfirmedBalance = unconfirmedBalances.has(fromWallet.address)
        ? unconfirmedBalances.get(fromWallet.address)
        : 0;
      const balance = balances.has(fromWallet.address)
        ? balances.get(fromWallet.address)
        : 0;
      if (
        typeof unconfirmedBalance !== "undefined" &&
        typeof balance !== "undefined"
      ) {
        const tx = fromWallet.createTransaction(
          toAddress,
          amount,
          blocksRef.current,
          balance,
          unconfirmedBalance
        );
        if (tx) {
          txRef.current = [...txRef.current, tx];
          setTransactions(txRef.current);
          return true;
        }
      }
      return false;
    },
    [blocksRef, unconfirmedBalances]
  );

  useEffect(() => {
    if (running && typeof miningTimeout.current === "undefined") {
      miningTimeout.current = setInterval(() => {
        if (autoTx) {
          if (typeof txTimeout.current !== "undefined") {
            clearInterval(txTimeout.current);
          }
          const noOfTxs = Math.floor(Math.random() * 10) + 1;
          const TxTime = TIMEOUT / noOfTxs;
          txTimeout.current = setInterval(() => {
            const fromWallet = getRandomNode();
            const toWallet = getRandomNode();
            if (fromWallet !== null && toWallet !== null) {
              const amount = 0;
              createTransaction(fromWallet, toWallet.address, amount);
            }
          }, TxTime);
        }
        const minerWallet = getRandomNode();
        if (minerWallet) {
          mineBlock(minerWallet.address);
        }
      }, TIMEOUT);
    }
    if (!running && typeof miningTimeout.current !== "undefined") {
      clearTimeout(miningTimeout.current);
      miningTimeout.current = undefined;
      if (typeof txTimeout.current !== "undefined") {
        clearInterval(txTimeout.current);
        txTimeout.current = undefined;
      }
    }
  }, [running, autoTx, blocksRef, getRandomNode, createTransaction]);

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
                    balances={balances}
                    unconfirmedBalances={unconfirmedBalances}
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
