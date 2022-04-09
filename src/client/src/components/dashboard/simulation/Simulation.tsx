import React from "react";
import { Divider, Grid } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import SimulationControl from "./SimulationControl";
import Nodes from "../Nodes";
import UnconfirmedTransactions from "../UnconfirmedTransactions";
import BlockChain from "../Blockchain";
import Blocks from "../../blocks/Blocks";
import Transactions from "../../transactions/Transactions";

function Simulation() {
  return (
    <Routes>
      <Route path="/">
        <Route
          index
          element={
            <>
              <SimulationControl />
              <Divider style={{ margin: 10 }} />
              <Grid>
                <Divider />
                <Grid.Col span={6}>
                  <Nodes />
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

export default Simulation;
