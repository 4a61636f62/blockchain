import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Anchor,
  Table,
  Modal,
  Title,
  Container,
  Pagination,
} from "@mantine/core";
import * as Blockchain from "lib/blockchain";

function BlockModal({
  index,
  block,
  opened,
}: {
  index: number;
  block: Blockchain.Block;
  opened: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Modal
      size="xl"
      opened={opened}
      onClose={() => navigate("/blocks")}
      title={<Title order={3}>Block #{index}</Title>}
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
            <td>Previous Hash:</td>
            <td>
              <Anchor component={Link} to={`/blocks/${block.prevHash}`}>
                {block.prevHash}
              </Anchor>
            </td>
          </tr>
          <tr>
            <td>Miner</td>
            <td>{block.minerAddress}</td>
          </tr>
          <tr>
            <td>Nonce</td>
            <td>{block.nonce}</td>
          </tr>
        </tbody>
      </Table>
      <Title order={3} style={{ marginTop: 40, marginBottom: 20 }}>
        Transactions
      </Title>
      <Table style={{ textAlign: "left" }}>
        <thead>
          <th>txID</th>
          <th>Time</th>
          <th>Type</th>
          <th>Amount</th>
        </thead>
        <tbody>
          {block.txs.map((tx) => (
            <tr>
              <td>
                <Anchor component={Link} to={`/transactions/${tx.txid}`}>
                  {`${tx.txid.slice(0, 20)}...`}
                </Anchor>
              </td>
              <td>{new Date(tx.timestamp).toLocaleString()}</td>
              <td>{tx.inputs.length === 0 ? "Block Reward" : "Transfer"} </td>
              <td>{tx.outputs[0].amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Modal>
  );
}

function BlockRow({
  index,
  block,
}: {
  index: number;
  block: Blockchain.Block;
}) {
  return (
    <tr>
      <td>{index}</td>
      <td>{new Date(block.timestamp).toLocaleTimeString()}</td>
      <td>
        <Anchor component={Link} to={`/blocks/${block.hash}`}>
          {block.hash}
        </Anchor>
      </td>
      <td>{block.txs.length}</td>
    </tr>
  );
}

function Blocks({ blocks }: { blocks: Blockchain.Block[] }) {
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
              <th>Hash</th>
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
