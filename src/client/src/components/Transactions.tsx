import React from "react";
import { Tx } from "../../../blockchain/tx"
import {Table, Title} from "@mantine/core";


export const Transactions: React.FC<{transactions: Tx[]}> = ({ transactions }) =>
    <>
        <Title order={3}>Unconfirmed Transactions</Title>
        <Table>
            <thead>
            <tr>
                <th>Hash</th>
                <th>Time</th>
                <th>Amount</th>
            </tr>
            </thead>
            <tbody>
            {/*{transactions.map((b,i) =>*/}
            {/*    <TransactionRow key={b.hash} index={i} block={b} />*/}
            {/*)}*/}
            </tbody>
        </Table>
    </>

// const TransactionRow: React.FC<{transaction: Tx}> = ({ transaction }) => {
//     // format transactions and convert timestamp to local time
//     const [opened, setOpened] = useState(false)
//     return (
//         <tr key={transaction.hash}>
//             <td>
//                 <Anchor onClick={() => setOpened(true)}>{index}</Anchor>
//             </td>
//             <td>{block.timestamp}</td>
//             <td>{block.txs.length}</td>
//             <BlockModal index={index} block={block} opened={opened} setOpened={setOpened} />
//         </tr>
//     )
// }