import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  inputTxs,
}: {
  tx: Transaction;
  inputTxs: Map<string, Transaction>;
  opened: boolean;
}) {
  const navigate = useNavigate();

  const getOutputAmount = useCallback(
    (txid: string, outputIndex: number) => {
      const inputTx = inputTxs.get(txid);
      if (typeof inputTx !== "undefined") {
        return inputTx.outputs[outputIndex].amount;
      }
      return 0;
    },
    [tx, inputTxs]
  );

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
              <div key={i.txid + i.outputIndex}>
                <Anchor
                  component={Link}
                  to={`/transactions/${i.txid}`}
                >{`txid: ${i.txid.slice(0, 10)}...${i.txid.slice(
                  tx.txid.length - 11
                )}`}</Anchor>
                <Text>{`Output Index: ${i.outputIndex}`}</Text>
                <Text>{`Amount ${getOutputAmount(
                  i.txid,
                  i.outputIndex
                )}`}</Text>
                <br />
              </div>
            ))
          ) : (
            <Text>Block Reward</Text>
          )}
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>Outputs:</Text>
          {tx.outputs.map((o) => (
            <div key={o.address + o.amount}>
              <Text>{`Amount: ${o.amount}`}</Text>
              <Text>{`To: ${o.address}`}</Text>
              <br />
            </div>
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

  const [openTx, setOpenTx] = useState<Transaction | undefined>(undefined);

  const txMap = useMemo(() => {
    const map = new Map<string, Transaction>();
    txs.forEach((tx) => {
      map.set(tx.txid, tx);
    });
    return map;
  }, [confirmed, unconfirmed]);

  useEffect(() => {
    if (typeof txid !== "undefined") {
      const tx = txMap.get(txid);
      if (typeof tx !== "undefined") {
        setPage(Math.floor(txs.findIndex((t) => t.txid === tx.txid) / 10) + 1);
        setOpenTx(tx);
      }
    }
  }, [txid, confirmed, unconfirmed]);

  const getInputTxs = useCallback(
    (tx: Transaction) => {
      const inputTxs = new Map<string, Transaction>();
      tx.inputs.forEach((input) => {
        const inputTx = txMap.get(input.txid);
        if (typeof inputTx !== "undefined") {
          inputTxs.set(inputTx.txid, inputTx);
        }
      });
      return inputTxs;
    },
    [txMap]
  );

  return (
    <Container key={txid}>
      {txid && typeof openTx !== "undefined" && (
        <TransactionModal tx={openTx} inputTxs={getInputTxs(openTx)} opened />
      )}
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
