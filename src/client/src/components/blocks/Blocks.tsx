import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
}: {
  index: number;
  block: Block;
  opened: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Modal
      size="xl"
      opened={opened}
      onClose={() => navigate("/blocks")}
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
            <td>
              <Anchor component={Link} to={`/blocks/${block.prevHash}`}>
                Previous Hash
              </Anchor>
            </td>
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
  return (
    <tr>
      <td>
        <Anchor component={Link} to={`/blocks/${block.hash}`}>
          {index}
        </Anchor>
      </td>
      <td>{new Date(block.timestamp).toLocaleTimeString()}</td>
      <td>{block.minerAddress}</td>
      <td>{block.txs.length}</td>
    </tr>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  const [page, setPage] = useState(1);
  const { hash } = useParams();

  const [blockIndex, setBlockIndex] = useState(-1);

  useEffect(() => {
    if (typeof hash !== "undefined") {
      const index = blocks.findIndex((b) => b.hash === hash);
      setBlockIndex(index);
      setPage(Math.floor((blocks.length - index - 1) / 10) + 1);
    }
  }, [hash, blocks]);

  return (
    <Container style={{ minHeight: 500 }}>
      {hash && blockIndex >= 0 && (
        <BlockModal index={blockIndex} block={blocks[blockIndex]} opened />
      )}
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
        onChange={(p) => {
          setPage(p);
        }}
      />
    </Container>
  );
}

export default Blocks;
