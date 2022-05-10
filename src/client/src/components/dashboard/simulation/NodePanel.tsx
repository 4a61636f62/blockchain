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
  Badge,
  Popover,
  Group,
} from "@mantine/core";
import * as Blockchain from "lib/blockchain";
import TransactionForm from "../shared/TransactionForm";

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
  wallet: Blockchain.Wallet;
  name: string;
  nodes: Map<string, Blockchain.Wallet>;
  balance: number | undefined;
  unconfirmedBalance: number | undefined;
  mineBlock: (minerAddress: string) => void;
  createTransaction: (toAddress: string, amount: number) => boolean;
  disableMiningButton: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  return (
    <Card withBorder data-testid={name}>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <TransactionForm
          createTransaction={createTransaction}
          nodes={nodes}
          closeForm={() => setOpened(false)}
          balance={balance}
          unconfirmedBalance={unconfirmedBalance}
        />
      </Modal>
      <Grid>
        <Grid.Col span={6}>
          <Title order={3}>{name}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Button
            size="xs"
            onClick={() => mineBlock(wallet.address)}
            disabled={disableMiningButton}
            style={{ margin: 5 }}
          >
            Mine
          </Button>
          <Button
            size="xs"
            onClick={() => setOpened(true)}
            style={{ margin: 5 }}
          >
            Transaction
          </Button>
        </Grid.Col>
      </Grid>
      <Group>
        <Text>Address:</Text>
        <Popover
          opened={showAddress}
          onClose={() => setShowAddress(false)}
          position="top"
          placement="center"
          withArrow
          onMouseEnter={() => setShowAddress(true)}
          onMouseLeave={() => setShowAddress(false)}
          target={
            <Badge
              onMouseEnter={() => setShowAddress(true)}
              onMouseLeave={() => setShowAddress(false)}
            >
              {wallet.address.slice(0, 10)}...
            </Badge>
          }
        >
          <Text size="xs">{wallet.address}</Text>
        </Popover>
      </Group>
      <Group>
        <Text>Balance: </Text>
        <Text>
          {typeof balance === "undefined" ? 0 : balance}{" "}
          {typeof unconfirmedBalance === "undefined"
            ? ""
            : ` [${
                unconfirmedBalance > 0 ? "+" : ""
              }${unconfirmedBalance} unconfirmed]`}
        </Text>
      </Group>
    </Card>
  );
}

function NodePanel({
  nodes,
  balances,
  unconfirmedBalances,
  mineBlock,
  createTransaction,
  running,
}: {
  nodes: Map<string, Blockchain.Wallet>;
  balances: Map<string, number>;
  unconfirmedBalances: Map<string, number>;
  mineBlock: (minerAddress: string) => void;
  createTransaction: (
    fromWallet: Blockchain.Wallet,
    toAddress: string,
    amount: number
  ) => boolean;
  running: boolean;
}) {
  const nodeCards = Array.from(nodes.entries()).map(([name, w]) => (
    <Node
      name={name}
      wallet={w}
      nodes={nodes}
      key={w.address}
      balance={balances.get(w.address)}
      unconfirmedBalance={unconfirmedBalances.get(w.address)}
      mineBlock={mineBlock}
      createTransaction={(toAddress: string, amount: number) =>
        createTransaction(w, toAddress, amount)
      }
      disableMiningButton={running}
    />
  ));
  return (
    <Container>
      <div style={{ height: 70 }}>
        <Title>Nodes</Title>{" "}
      </div>
      <ScrollArea style={{ height: 500 }} data-testid="nodes">
        {nodeCards}
      </ScrollArea>
    </Container>
  );
}

export default NodePanel;
