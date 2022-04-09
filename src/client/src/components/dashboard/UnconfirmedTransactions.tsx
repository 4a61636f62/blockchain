import React from "react";
import { Card, Container, ScrollArea, Title } from "@mantine/core";

function Transaction() {
  return <Card withBorder>Transaction</Card>;
}

function UnconfirmedTransactions() {
  const txs: JSX.Element[] = [];
  for (let i = 0; i < 100; i += 1) {
    txs.push(<Transaction />);
  }
  return (
    <Container>
      <Title>Unconfirmed Transactions</Title>
      <ScrollArea style={{ height: 500 }}>{txs}</ScrollArea>
    </Container>
  );
}

export default UnconfirmedTransactions;
