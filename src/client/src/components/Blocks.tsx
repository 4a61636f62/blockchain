import React, {useState} from "react";
import {Block} from "../../../blockchain/block";
import {Anchor, Table, Modal, ScrollArea, Title, Container} from "@mantine/core";

export const Blocks: React.FC<{blocks: Block[]}> = ({ blocks }) =>
    <Container style={{minHeight: 500}}>
        <Title order={3}>Blocks</Title>
        <Table>
            <thead>
                <tr>
                    <th>Height</th>
                    <th>Time</th>
                    <th>Miner</th>
                    <th>Transactions</th>
                </tr>
            </thead>
            <tbody>
                {blocks.map((b,i) =>
                    <BlockRow key={b.hash} index={i} block={b} />
                ).reverse().slice(0, 10)}
            </tbody>
        </Table>
    </Container>

const BlockRow: React.FC<{index: number, block: Block}> = ({ index, block}) => {
    // format transactions and convert timestamp to local time
    const [opened, setOpened] = useState(false)
    return (
        <tr>
            <td>
                <Anchor onClick={() => setOpened(true)}>{index}</Anchor>
                </td>
            <td>{new Date(block.timestamp).toLocaleTimeString()}</td>
            <td>{block.minerAddress}</td>
            <td>{block.txs.length}</td>
            <BlockModal index={index} block={block} opened={opened} setOpened={setOpened} />
        </tr>
    )
}

const BlockModal: React.FC<{index: number, block: Block, opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>>}> =
    ({ index, block, opened, setOpened }) =>
    <Modal
        size="xl"
        opened={opened}
        onClose={() => setOpened(false)}
        title={`block #${index}`}
    >
        <Table>
            <tbody>
                <tr>
                    <td>Mined</td>
                    <td>{new Date(block.timestamp).toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Hash</td>
                    <td>{block.hash}</td>
                </tr>
                <tr>
                    <td>Previous Hash</td>
                    <td>{block.prevHash}</td>
                </tr>
                <tr>
                    <td>Nonce</td>
                    <td>{block.nonce}</td>
                </tr>
            </tbody>
        </Table>
        <ScrollArea style={{height: 250}}>

        </ScrollArea>
    </Modal>
