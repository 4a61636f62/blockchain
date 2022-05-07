import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Divider, Grid } from "@mantine/core";
import { Routes, Route } from "react-router-dom";
import * as Blockchain from "lib/blockchain";
import { Message, MessageTypes } from "lib/message";
import TransactionPanel from "../shared/TransactionPanel";
import BlockPanel from "../shared/BlockPanel";
import WalletPanel from "./WalletPanel";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";
import { reducer } from "../../../utils/reducers";
import { BlockchainClient } from "../../../services/blockchain-client";

function Live() {
  const [mining, setMining] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    client: new BlockchainClient(),
    blocks: [],
    transactions: [],
    wallet: new Blockchain.Wallet(),
  });

  function handleMessages(message: Message): void {
    switch (message.type) {
      case MessageTypes.NewBlockAnnouncement:
        dispatch({ type: "handle-block-announcement", message });
        break;
      case MessageTypes.TransactionAnnouncement:
        dispatch({ type: "handle-transaction-announcement", message });
        break;
      case MessageTypes.ChainRequest:
        dispatch({ type: "handle-chain-request" });
        break;
      case MessageTypes.ChainResponse:
        dispatch({ type: "handle-chain-response", message });
        break;
      default:
    }
  }

  useEffect(() => {
    (async () => {
      await state.client.connect(handleMessages);
      dispatch({ type: "send-chain-request" });
    })();
  }, []);

  const balances = Blockchain.getAddressBalances(state.blocks);
  const unconfirmedBalances = Blockchain.getAddressUnconfirmedBalances(
    state.blocks,
    state.transactions
  );

  const mine = useCallback(() => {
    if (mining) {
      return;
    }
    setMining(true);
    let block: Blockchain.Block;
    if (state.blocks.length === 0) {
      block = Blockchain.mineGenesisBlock(state.wallet.address, 1);
    } else {
      block = Blockchain.mineBlock(
        state.blocks[state.blocks.length - 1],
        state.transactions,
        state.wallet.address
      );
    }
    dispatch({ type: "add-block", block });
    dispatch({ type: "send-block-announcement", block });
    setMining(false);
  }, [state]);

  const createTransaction = useCallback(
    (toAddress: string, amount: number) => {
      const unconfirmedBalance = unconfirmedBalances.has(state.wallet.address)
        ? unconfirmedBalances.get(state.wallet.address)
        : 0;
      const balance = balances.has(state.wallet.address)
        ? balances.get(state.wallet.address)
        : 0;
      if (
        typeof unconfirmedBalance !== "undefined" &&
        typeof balance !== "undefined"
      ) {
        const tx = state.wallet.createTransaction(
          toAddress,
          amount,
          state.blocks
        );
        if (tx) {
          dispatch({ type: "add-transaction", transaction: tx });
          dispatch({ type: "send-transaction-announcement", transaction: tx });
          return true;
        }
      }
      return false;
    },
    [state, balances]
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
                    wallet={state.wallet}
                    balance={balances.get(state.wallet.address)}
                    unconfirmedBalance={unconfirmedBalances.get(
                      state.wallet.address
                    )}
                    createTransaction={createTransaction}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TransactionPanel transactions={state.transactions} />
                </Grid.Col>
              </Grid>
              <Divider style={{ margin: 10 }} />
              <BlockPanel blocks={state.blocks} mine={mine} />
            </>
          }
        />
        <Route path="blocks">
          <Route index element={<Blocks blocks={state.blocks} />} />
          <Route path=":hash" element={<Blocks blocks={state.blocks} />} />
        </Route>
        <Route path="transactions">
          <Route
            index
            element={
              <Transactions
                confirmed={Blockchain.getTransactions(state.blocks)}
                unconfirmed={state.transactions}
              />
            }
          />
          <Route
            path=":txid"
            element={
              <Transactions
                confirmed={Blockchain.getTransactions(state.blocks)}
                unconfirmed={state.transactions}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default Live;
