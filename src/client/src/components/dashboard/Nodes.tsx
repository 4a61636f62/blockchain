import React, { useState } from "react";
import {
  Card,
  Container,
  ScrollArea,
  Title,
  Text,
  Button,
  Grid,
  Modal,
} from "@mantine/core";
import { Wallet } from "lib/wallet";
import { BlockchainUtils } from "lib/blockchain-utils";
import { Block, Transaction } from "lib/blockchain";
import CreateTransaction from "./CreateTransaction";

function Node({
  wallet,
  name,
  nodes,
  balance,
  unconfirmedBalance,
  mineBlock,
  createTransaction,
  disableMiningButton,
}: {
  wallet: Wallet;
  name: string;
  nodes: Map<string, Wallet>;
  balance: number | undefined;
  unconfirmedBalance: number | undefined;
  mineBlock: (minerAddress: string) => void;
  createTransaction: (toAddress: string, amount: number) => boolean;
  disableMiningButton: boolean;
}) {
  const [opened, setOpened] = useState(false);

  const nodeList = Array.from(nodes.entries())
    .map(([n, w]) => ({
      value: w.address,
      label: n,
    }))
    .filter((n) => n.label !== name);

  return (
    <Card withBorder>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <CreateTransaction
          createTransaction={createTransaction}
          nodeList={nodeList}
          closeForm={() => setOpened(false)}
        />
      </Modal>
      <Grid>
        <Grid.Col span={6}>
          <Title order={3}>{name}</Title>
          <Text>Address: {wallet.address}</Text>
          <Text>
            Balance: {typeof balance === "undefined" ? 0 : balance}
            {typeof unconfirmedBalance === "undefined"
              ? ""
              : ` [${
                  unconfirmedBalance > 0 ? "+" : ""
                }${unconfirmedBalance} unconfirmed]`}
          </Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Button
            onClick={() => mineBlock(wallet.address)}
            disabled={disableMiningButton}
          >
            Mine
          </Button>
          <Button onClick={() => setOpened(true)}>Transaction</Button>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

function Nodes({
  nodes,
  blocks,
  transactions,
  mineBlock,
  createTransaction,
  running,
}: {
  nodes: Map<string, Wallet>;
  blocks: Block[];
  transactions: Transaction[];
  mineBlock: (minerAddress: string) => void;
  createTransaction: (
    fromWallet: Wallet,
    toAddress: string,
    amount: number
  ) => boolean;
  running: boolean;
}) {
  const balances2 = BlockchainUtils.getAddressBalances(blocks);
  const unconfirmedBalances2 = BlockchainUtils.getAddressUnconfirmedBalances(
    blocks,
    transactions
  );
  const nodeCards = Array.from(nodes.entries()).map(([name, w]) => (
    <Node
      name={name}
      wallet={w}
      nodes={nodes}
      key={w.address}
      balance={balances2.get(w.address)}
      unconfirmedBalance={unconfirmedBalances2.get(w.address)}
      mineBlock={mineBlock}
      createTransaction={(toAddress: string, amount: number) =>
        createTransaction(w, toAddress, amount)
      }
      disableMiningButton={running}
    />
  ));
  return (
    <Container>
      <Title>Nodes</Title>
      <ScrollArea style={{ height: 500 }}>{nodeCards}</ScrollArea>
    </Container>
  );
}

export default Nodes;
