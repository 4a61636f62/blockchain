import React from "react";
import { Divider, Grid } from "@mantine/core";
import { Routes, Route } from "react-router-dom";
import UnconfirmedTransactions from "../UnconfirmedTransactions";
import BlockChain from "../Blockchain";
import Wallet from "./Wallet";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";

function Live() {
  return (
    <Routes>
      <Route path="/">
        <Route
          index
          element={
            <>
              <Grid>
                <Grid.Col span={6}>
                  <Wallet />
                </Grid.Col>
                <Grid.Col span={6}>
                  <UnconfirmedTransactions />
                </Grid.Col>
              </Grid>
              <Divider style={{ margin: 10 }} />
              <BlockChain />
            </>
          }
        />
        <Route path="blocks" element={<Blocks blocks={[]} />} />
        <Route
          path="transactions"
          element={<Transactions transactions={[]} />}
        />
      </Route>
    </Routes>
  );
}

export default Live;
