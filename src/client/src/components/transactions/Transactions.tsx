import React, { useEffect, useState } from "react";
import { Container, Modal, Pagination, Table, Title } from "@mantine/core";
import { Transaction } from "lib/blockchain";
import { useNavigate, useParams } from "react-router-dom";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    // format transactions and convert timestamp to local time
    <tr>
      <td>{transaction.txid}</td>
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
    <Modal opened={opened} onClose={() => navigate("/transactions")}>
      {tx.txid}
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
