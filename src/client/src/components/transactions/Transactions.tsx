import React, { useEffect, useState } from "react";
import {
  Anchor,
  Container,
  Divider,
  Grid,
  Modal,
  Pagination,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Transaction } from "lib/blockchain";
import { Link, useNavigate, useParams } from "react-router-dom";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    // format transactions and convert timestamp to local time
    <tr>
      <td>
        <Anchor component={Link} to={`/transactions/${transaction.txid}`}>
          {transaction.txid}
        </Anchor>
      </td>
      <td>{transaction.inputs.length}</td>
      <td>{transaction.outputs.length}</td>
    </tr>
  );
}

function TransactionModal({
  tx,
  opened,
}: {
  tx: Transaction;
  opened: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Modal opened={opened} onClose={() => navigate("/transactions")} size="50%">
      <Text>{tx.txid}</Text>
      <Text>{new Date(tx.timestamp).toLocaleTimeString()}</Text>
      <Divider />
      <Grid>
        <Grid.Col span={6}>
          <Text>Inputs:</Text>
          {tx.inputs.length > 0 ? (
            tx.inputs.map((i) => (
              <>
                <Anchor
                  component={Link}
                  to={`/transactions/${i.txid}`}
                >{`txid: ${i.txid.slice(0, 10)}...${i.txid.slice(
                  tx.txid.length - 11
                )}`}</Anchor>
                <Text>{`index: ${i.outputIndex}`}</Text>
                <br />
              </>
            ))
          ) : (
            <Text>Block Reward</Text>
          )}
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>Outputs:</Text>
          {tx.outputs.map((o) => (
            <>
              <Text>{`Amount: ${o.amount}`}</Text>
              <Text>{`To: ${o.address}`}</Text>
              <br />
            </>
          ))}
        </Grid.Col>
      </Grid>
    </Modal>
  );
}

function Transactions({
  confirmed,
  unconfirmed,
}: {
  confirmed: Transaction[];
  unconfirmed: Transaction[];
}) {
  const txs = [...[...unconfirmed].reverse(), ...[...confirmed].reverse()];
  const [page, setPage] = useState(1);
  const { txid } = useParams();
  const [txIndex, setTxIndex] = useState(-1);

  useEffect(() => {
    if (typeof txid !== "undefined") {
      const index = txs.findIndex((t) => t.txid === txid);
      setTxIndex(index);
      setPage(Math.floor(index / 10) + 1);
    }
  }, [txid, confirmed, unconfirmed]);

  return (
    <Container key={txid}>
      {txid && txIndex >= 0 && <TransactionModal tx={txs[txIndex]} opened />}
      <Title order={3}>Transactions</Title>
      <div style={{ height: 500 }}>
        <Table>
          <thead>
            <tr>
              <th>TXID</th>
              <th>Inputs</th>
              <th>Outputs</th>
            </tr>
          </thead>
          <tbody>
            {txs
              .map((t) => <TransactionRow key={t.txid} transaction={t} />)
              .slice((page - 1) * 10, (page - 1) * 10 + 10)}
          </tbody>
        </Table>
      </div>
      <Pagination
        total={Math.ceil(txs.length / 10)}
        page={page}
        onChange={(p) => {
          setPage(p);
        }}
      />
    </Container>
  );
}

export default Transactions;
