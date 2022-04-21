import React from "react";
import { Container, Grid, Text, Title } from "@mantine/core";
import { Wallet } from "lib/wallet";
import CreateTransaction from "../CreateTransaction";

function WalletPanel({
  wallet,
  balance,
  unconfirmedBalance,
  createTransaction,
}: {
  wallet: Wallet;
  balance: number | undefined;
  unconfirmedBalance: number | undefined;
  createTransaction: (toAddress: string, amount: number) => boolean;
}) {
  return (
    <Container>
      <Title>Wallet</Title>
      <Grid>
        <Grid.Col span={6}>
          <Title order={6}>Address</Title>
          <Text>{wallet.address}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Title order={6}>Balance</Title>
          <Text>
            Balance: {typeof balance === "undefined" ? 0 : balance}
            {typeof unconfirmedBalance === "undefined"
              ? ""
              : ` [${
                  unconfirmedBalance > 0 ? "+" : ""
                }${unconfirmedBalance} unconfirmed]`}
          </Text>
        </Grid.Col>
        <Grid.Col span={3} />
        <Grid.Col span={6}>
          <CreateTransaction createTransaction={createTransaction} />
        </Grid.Col>
        <Grid.Col span={6} />
        <Grid.Col span={3} />
      </Grid>
    </Container>
  );
}

export default WalletPanel;
