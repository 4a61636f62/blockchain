import React from "react";
import {Container, Table, Title} from "@mantine/core";
import {Transaction} from "../../../blockchain/transaction";


export const Transactions: React.FC<{transactions: Transaction[]}> = ({ transactions }) =>
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
            {transactions.map((t) =>
                <TransactionRow key={t.txid} transaction={t} />
            )}
            </tbody>
        </Table>
    </Container>

const TransactionRow: React.FC<{transaction: Transaction}> = ({ transaction }) => {
    // format transactions and convert timestamp to local time
    return (
        <tr>
            <td>{transaction.txid}</td>
            <td>{transaction.inputs.length}</td>
            <td>{transaction.outputs.length}</td>
        </tr>
    )
}