import React from "react";
import { Card, Container, ScrollArea, Title } from "@mantine/core";
import { Transaction } from "lib/blockchain";

function TransactionCard({ transaction }: { transaction: Transaction }) {
  return <Card withBorder>{transaction.txid}</Card>;
}

function UnconfirmedTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <Container>
      <Title>Unconfirmed Transactions</Title>
      <ScrollArea style={{ height: 500 }}>
        {transactions.map((t) => (
          <TransactionCard transaction={t} key={t.txid} />
        ))}
      </ScrollArea>
    </Container>
  );
}

export default UnconfirmedTransactions;
