import React from "react";
import { Card, Container, ScrollArea, Title } from "@mantine/core";

function Node() {
  return <Card withBorder>Node</Card>;
}

function Nodes() {
  const nodes: JSX.Element[] = [];
  for (let i = 0; i < 100; i += 1) {
    nodes.push(<Node />);
  }
  return (
    <Container>
      <Title>Nodes</Title>
      <ScrollArea style={{ height: 500 }}>{nodes}</ScrollArea>
    </Container>
  );
}

export default Nodes;
