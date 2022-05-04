import React, { useEffect, useRef } from "react";
import { useHover, useViewportSize } from "@mantine/hooks";
import {
  Card,
  Center,
  Container,
  Group,
  ScrollArea,
  Title,
  Text,
  Button,
  Badge,
} from "@mantine/core";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import * as Blockchain from "lib/blockchain";
import { useNavigate } from "react-router-dom";

const BLOCK_WIDTH = 310;
const ARROW_WIDTH = 100;

function BlockCard({
  block,
  index,
  onClick,
}: {
  block: Blockchain.Block;
  index: number;
  onClick: () => void;
}) {
  const { hovered, ref } = useHover();
  return (
    <div
      style={{
        width: BLOCK_WIDTH,
        margin: 0,
      }}
    >
      <Card
        withBorder
        style={{ cursor: "pointer", background: hovered ? "#f8f9fa" : "white" }}
        onClick={onClick}
        ref={ref}
      >
        <Group style={{ padding: 0 }} align="baseline" spacing={5}>
          <Title>Block #{index}</Title>
          <Text size="sm">
            at {new Date(block.timestamp).toLocaleTimeString()}
          </Text>
        </Group>
        <Group>
          <Text style={{ width: 80 }}>Hash: </Text>
          <Badge style={{ cursor: "pointer" }}>
            {block.hash.slice(0, 20)}...
          </Badge>
        </Group>
        {block.prevHash !== "0" ? (
          <Group>
            <Text style={{ width: 80 }}>Prev Hash:</Text>
            <Badge style={{ cursor: "pointer" }}>
              {block.prevHash.slice(0, 20)}...
            </Badge>
          </Group>
        ) : (
          <br />
        )}
        <br />
        <Group>
          <Text>Transactions: {block.txs.length}</Text>
          <Text>Nonce: {block.nonce}</Text>
        </Group>
      </Card>
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
        <HiOutlineArrowNarrowRight size={50} />
      </Center>
    </div>
  );
}

function BlockPanel({
  blocks,
  mine,
}: {
  blocks: Blockchain.Block[];
  mine: (() => void) | false;
}) {
  const navigate = useNavigate();
  const { width } = useViewportSize();
  const viewport = useRef<HTMLDivElement>(null);
  const elements: JSX.Element[] = [];
  blocks.forEach((b, index) => {
    elements.push(
      <BlockCard
        block={b}
        index={index}
        key={b.hash}
        onClick={() => navigate(`/blocks/${b.hash}`)}
      />
    );
    if (index !== blocks.length - 1) {
      elements.push(<Arrow key={`arrow${b.hash}`} />);
    }
  });

  useEffect(() => {
    if (viewport.current != null)
      viewport.current.scrollTo({
        left: viewport.current.scrollWidth,
      });
  });

  return (
    <Container size={width * 0.75}>
      <Center>
        <Title style={{ padding: 10 }}>Blocks</Title>
        {mine && <Button onClick={mine}>Mine!</Button>}
      </Center>
      <Center>
        <ScrollArea viewportRef={viewport}>
          <div
            style={{
              width:
                BLOCK_WIDTH * blocks.length + (ARROW_WIDTH * blocks.length - 2),
            }}
          >
            <Group direction="row" spacing={0}>
              {elements}
            </Group>
          </div>
        </ScrollArea>
      </Center>
    </Container>
  );
}

export default BlockPanel;
