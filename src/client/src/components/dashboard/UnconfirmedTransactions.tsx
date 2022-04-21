import React, { useState } from "react";
import {
  Anchor,
  Card,
  Container,
  Modal,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import { Transaction } from "lib/blockchain";
import { Link } from "react-router-dom";

function TransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <Card withBorder style={{ cursor: "pointer" }}>
      <Text>{new Date(transaction.timestamp).toLocaleTimeString()}</Text>
      <Anchor component={Link} to={`/transactions/${transaction.txid}`}>
        TxID: {transaction.txid}
      </Anchor>
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
          <TransactionCard transaction={t} key={t.txid} />
        ))}
      </ScrollArea>
    </Container>
  );
}

export default UnconfirmedTransactions;
