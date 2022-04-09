import React, { useEffect, useRef } from "react";
import {
  Card,
  Center,
  Container,
  Group,
  ScrollArea,
  Title,
} from "@mantine/core";
import { Block } from "lib/blockchain";

const BLOCK_WIDTH = 200;
const ARROW_WIDTH = 100;

function BlockCard({ block }: { block: Block }) {
  return (
    <div
      style={{
        width: BLOCK_WIDTH,
        margin: 0,
      }}
    >
      <Card withBorder>{block.hash}</Card>
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

function BlockChain({ blocks }: { blocks: Block[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const elements: JSX.Element[] = [];
  blocks.forEach((b, index) => {
    elements.push(<BlockCard block={b} key={b.hash} />);
    if (index !== blocks.length - 1) {
      elements.push(<Arrow key={`arrow${b.hash}`} />);
    }
  });

  useEffect(() => {
    if (viewport.current != null)
      viewport.current.scrollTo({ left: viewport.current.scrollWidth });
  });

  return (
    <Container size="xl">
      <Center>
        <Title>Blocks</Title>
      </Center>
      <ScrollArea viewportRef={viewport}>
        <div style={{ width: (BLOCK_WIDTH + ARROW_WIDTH) * blocks.length }}>
          <Group direction="row" spacing={0}>
            {elements}
          </Group>
        </div>
      </ScrollArea>
    </Container>
  );
}

export default BlockChain;
