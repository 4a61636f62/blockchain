import React, { useState } from "react";
import {
  Anchor,
  Card,
  Container,
  Grid,
  Modal,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import * as Blockchain from "lib/blockchain";
import { Link } from "react-router-dom";

function TransactionCard({
  transaction,
}: {
  transaction: Blockchain.Transaction;
}) {
  return (
    <Card withBorder data-testid={transaction.txid}>
      <Grid>
        <Grid.Col span={6}>
          <Anchor component={Link} to={`/transactions/${transaction.txid}`}>
            {`${transaction.txid.slice(0, 20)}...`}
          </Anchor>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>{new Date(transaction.timestamp).toLocaleTimeString()}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>{transaction.outputs[0].amount}</Text>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

function TableHeaders() {
  return (
    <Card style={{ paddingTop: 0, paddingBottom: 0 }}>
      <Grid>
        <Grid.Col span={6}>
          <Text>txID</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>Time</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <Text>Amount</Text>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

function TransactionPanel({
  transactions,
}: {
  transactions: Blockchain.Transaction[];
}) {
  const [openTx, setOpenTx] = useState<Blockchain.Transaction | null>(null);
  return (
    <Container data-testid="TransactionPanel">
      <div style={{ height: 70 }}>
        <Title>Transactions</Title>
        <TableHeaders />
      </div>
      <Modal opened={openTx !== null} onClose={() => setOpenTx(null)}>
        tx modal
      </Modal>
      <ScrollArea style={{ height: 500 }} data-testid="transactions">
        {transactions.map((t) => (
          <TransactionCard transaction={t} key={t.txid} />
        ))}
      </ScrollArea>
    </Container>
  );
}

export default TransactionPanel;
