import React from "react";
import { Container, Table, Title } from "@mantine/core";
import { Transaction } from "lib/blockchain";

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

export function Transactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Container>
      <Title order={3}>Unconfirmed Transactions</Title>
      <Table>
        <thead>
          <tr>
            <th>TXID</th>
            <th>Inputs</th>
            <th>Outputs</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <TransactionRow key={t.txid} transaction={t} />
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
