import React, { useState } from "react";
import {
  Anchor,
  Table,
  Modal,
  ScrollArea,
  Title,
  Container,
  Pagination,
} from "@mantine/core";
import { Block } from "lib/blockchain";

function BlockModal({
  index,
  block,
  opened,
  setOpened,
}: {
  index: number;
  block: Block;
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal
      size="xl"
      opened={opened}
      onClose={() => setOpened(false)}
      title={`block #${index}`}
    >
      <Table>
        <tbody>
          <tr>
            <td>Mined</td>
            <td>{new Date(block.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Hash</td>
            <td>{block.hash}</td>
          </tr>
          <tr>
            <td>Previous Hash</td>
            <td>{block.prevHash}</td>
          </tr>
          <tr>
            <td>Nonce</td>
            <td>{block.nonce}</td>
          </tr>
        </tbody>
      </Table>
      <ScrollArea style={{ height: 250 }} />
    </Modal>
  );
}

function BlockRow({ index, block }: { index: number; block: Block }) {
  // format transactions and convert timestamp to local time
  const [opened, setOpened] = useState(false);
  return (
    <tr>
      <td>
        <Anchor onClick={() => setOpened(true)}>{index}</Anchor>
      </td>
      <td>{new Date(block.timestamp).toLocaleTimeString()}</td>
      <td>{block.minerAddress}</td>
      <td>{block.txs.length}</td>
      <BlockModal
        index={index}
        block={block}
        opened={opened}
        setOpened={setOpened}
      />
    </tr>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  const [page, setPage] = useState(1);
  return (
    <Container style={{ minHeight: 500 }}>
      <Title order={3}>Blocks</Title>
      <div style={{ height: 500 }}>
        <Table>
          <thead>
            <tr>
              <th>Height</th>
              <th>Time</th>
              <th>Miner</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {blocks
              .map((b, i) => <BlockRow key={b.hash} index={i} block={b} />)
              .reverse()
              .slice((page - 1) * 10, (page - 1) * 10 + 10)}
          </tbody>
        </Table>
      </div>

      <Pagination
        total={Math.ceil(blocks.length / 10)}
        page={page}
        onChange={setPage}
      />
    </Container>
  );
}

export default Blocks;
