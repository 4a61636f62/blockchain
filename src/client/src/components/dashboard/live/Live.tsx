import React, { useCallback, useEffect, useRef, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Routes, Route } from "react-router-dom";
import { Message, MessageTypes } from "lib/message";
import {
  Block,
  Transaction,
  Wallet,
  validateBlock,
  getAddressBalances,
  getAddressUnconfirmedBalances,
  mineBlock,
  mineGenesisBlock,
  getTransactions,
} from "lib/blockchain";
import TransactionPanel from "../shared/TransactionPanel";
import BlockPanel from "../shared/BlockPanel";
import WalletPanel from "./WalletPanel";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";
import { BlockchainClient } from "../../../services/blockchain-client";

function Live() {
  const [mining, setMining] = useState(false);

  const client = useRef(new BlockchainClient());
  const wallet = useRef(new Wallet());

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleBlockAnnouncement = useCallback(
    (message: Message) => {
      if (typeof message.payload !== "undefined") {
        const block = JSON.parse(message.payload) as Block;
        if (
          blocks.length < 1 ||
          validateBlock(block, blocks[blocks.length - 1].hash)
        ) {
          setBlocks([...blocks, block]);
        }
      }
    },
    [blocks]
  );

  const handleTransactionAnnouncement = useCallback(
    (message: Message) => {
      if (typeof message.payload !== "undefined") {
        const transaction = JSON.parse(message.payload) as Transaction;
        setTransactions([...transactions, transaction]);
      }
    },
    [transactions]
  );

  const handleChainRequest = useCallback(
    (message: Message) => {
      client.current.sendChain(blocks, message.correlationId);
    },
    [blocks]
  );

  const handleChainResponse = useCallback((message: Message) => {
    if (typeof message.payload !== "undefined") {
      setBlocks(JSON.parse(message.payload) as Block[]);
    }
  }, []);

  useEffect(() => {
    client.current.connect();
  }, []);

  useEffect(() => {
    const handleMessages = (message: Message) => {
      switch (message.type) {
        case MessageTypes.NewBlockAnnouncement:
          handleBlockAnnouncement(message);
          break;
        case MessageTypes.TransactionAnnouncement:
          handleTransactionAnnouncement(message);
          break;
        case MessageTypes.ChainRequest:
          handleChainRequest(message);
          break;
        case MessageTypes.ChainResponse:
          handleChainResponse(message);
          break;
        default:
      }
    };
    client.current.setHandleMessages(handleMessages);
  }, [
    handleBlockAnnouncement,
    handleTransactionAnnouncement,
    handleChainResponse,
  ]);

  const balances = getAddressBalances(blocks);
  const unconfirmedBalances = getAddressUnconfirmedBalances(
    blocks,
    transactions
  );

  const mine = useCallback(() => {
    if (mining) {
      return;
    }
    setMining(true);
    let block: Block;
    if (blocks.length === 0) {
      block = mineGenesisBlock(wallet.current.address, 1);
    } else {
      block = mineBlock(
        blocks[blocks.length - 1],
        transactions,
        wallet.current.address
      );
    }
    setBlocks([...blocks, block]);
    client.current.announceBlock(block);
    setMining(false);
  }, [blocks, transactions]);

  const createTransaction = useCallback(
    (toAddress: string, amount: number) => {
      const unconfirmedBalance = unconfirmedBalances.has(wallet.current.address)
        ? unconfirmedBalances.get(wallet.current.address)
        : 0;
      const balance = balances.has(wallet.current.address)
        ? balances.get(wallet.current.address)
        : 0;
      if (
        typeof unconfirmedBalance !== "undefined" &&
        typeof balance !== "undefined"
      ) {
        const tx = wallet.current.createTransaction(toAddress, amount, blocks);
        if (tx) {
          setTransactions([...transactions, tx]);
          client.current.announceTransaction(tx);
          return true;
        }
      }
      return false;
    },
    [transactions, blocks]
  );

  return (
    <Routes>
      <Route path="/">
        <Route
          index
          element={
            <>
              <Grid>
                <Grid.Col span={6}>
                  <WalletPanel
                    wallet={wallet.current}
                    balance={balances.get(wallet.current.address)}
                    unconfirmedBalance={unconfirmedBalances.get(
                      wallet.current.address
                    )}
                    createTransaction={createTransaction}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TransactionPanel transactions={transactions} />
                </Grid.Col>
              </Grid>
              <Divider style={{ margin: 10 }} />
              <BlockPanel blocks={blocks} mine={mine} />
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
                confirmed={getTransactions(blocks)}
                unconfirmed={transactions}
              />
            }
          />
          <Route
            path=":txid"
            element={
              <Transactions
                confirmed={getTransactions(blocks)}
                unconfirmed={transactions}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default Live;
