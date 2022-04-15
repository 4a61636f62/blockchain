import React, { useState } from "react";
import { Card, Container, Modal, ScrollArea, Text, Title } from "@mantine/core";
import { Transaction } from "lib/blockchain";

function TransactionCard({
  transaction,
  setOpenTx,
}: {
  transaction: Transaction;
  setOpenTx: React.Dispatch<React.SetStateAction<Transaction | null>>;
}) {
  return (
    <Card
      withBorder
      onClick={() => setOpenTx(transaction)}
      style={{ cursor: "pointer" }}
    >
      <Text>{new Date(transaction.timestamp).toLocaleTimeString()}</Text>
      <Text>TxID: {transaction.txid}</Text>
      <Text>inputs: {transaction.inputs.length}</Text>
      <Text>outputs: {transaction.outputs.length}</Text>
    </Card>
  );
}

function UnconfirmedTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [openTx, setOpenTx] = useState<Transaction | null>(null);
  return (
    <Container>
      <Title>Unconfirmed Transactions</Title>
      <Modal opened={openTx !== null} onClose={() => setOpenTx(null)}>
        tx modal
      </Modal>
      <ScrollArea style={{ height: 500 }}>
        {transactions.map((t) => (
          <TransactionCard transaction={t} key={t.txid} setOpenTx={setOpenTx} />
        ))}
      </ScrollArea>
    </Container>
  );
}

export default UnconfirmedTransactions;
