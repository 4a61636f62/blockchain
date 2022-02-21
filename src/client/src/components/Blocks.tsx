import React, {useState} from "react";
import {Block} from "../../../blockchain/block";
import {Anchor, Table, Modal, ScrollArea, Title} from "@mantine/core";

export const Blocks: React.FC<{blocks: Block[]}> = ({ blocks }) =>
    <>
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
            )}
            </tbody>
        </Table>
    </>

const BlockRow: React.FC<{index: number, block: Block}> = ({ index, block}) => {
    // format transactions and convert timestamp to local time
    const timestamp = new Date(block.timestamp).toLocaleTimeString()
    const [opened, setOpened] = useState(false)
    return (
        <tr key={block.hash}>
            <td>
                <Anchor onClick={() => setOpened(true)}>{index}</Anchor>
                </td>
            <td>{timestamp}</td>
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
            <tr>
                <td>Mined</td>
                <td>{block.timestamp}</td>
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
        </Table>
        <ScrollArea style={{height: 250}}>

        </ScrollArea>
    </Modal>
