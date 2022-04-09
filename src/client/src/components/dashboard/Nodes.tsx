import React from "react";
import { Card, Container, ScrollArea, Title, Text } from "@mantine/core";
import { Wallet } from "lib/wallet";

function Node({ address }: { address: string }) {
  return (
    <Card withBorder>
      <Text>{address}</Text>
    </Card>
  );
}

function Nodes({ wallets }: { wallets: Wallet[] }) {
  const nodes = wallets.map((w) => (
    <Node address={w.address} key={w.address} />
  ));

  return (
    <Container>
      <Title>Nodes</Title>
      <ScrollArea style={{ height: 500 }}>{nodes}</ScrollArea>
    </Container>
  );
}

export default Nodes;
