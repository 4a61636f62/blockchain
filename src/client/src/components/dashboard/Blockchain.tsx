import React from "react";
import {
  Card,
  Center,
  Container,
  Group,
  ScrollArea,
  Title,
} from "@mantine/core";

const NUM_BLOCKS = 10;
const BLOCK_WIDTH = 200;
const ARROW_WIDTH = 100;

function Block({ index }: { index: number }) {
  return (
    <div
      style={{
        width: BLOCK_WIDTH,
        margin: 0,
      }}
    >
      <Card withBorder>Block #{index}</Card>
    </div>
  );
}

function Arrow() {
  return (
    <div
      style={{
        width: ARROW_WIDTH,
        margin: 0,
      }}
    >
      <Center>
        <p> {"=>"}</p>
      </Center>
    </div>
  );
}

function BlockChain() {
  const elements: JSX.Element[] = [];
  for (let i = 0; i < NUM_BLOCKS; i += 1) {
    elements.push(<Block index={i} />);
    elements.push(<Arrow />);
  }
  return (
    <Container size="xl">
      <Center>
        <Title>Blocks</Title>
      </Center>
      <ScrollArea style={{ padding: 0 }}>
        <div style={{ width: (BLOCK_WIDTH + ARROW_WIDTH) * NUM_BLOCKS }}>
          <Group direction="row" spacing={0}>
            {elements}
          </Group>
        </div>
      </ScrollArea>
    </Container>
  );
}

export default BlockChain;
