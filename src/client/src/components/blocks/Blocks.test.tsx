import { render, screen } from "@testing-library/react";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import React from "react";
import { createMemoryHistory } from "history";
import Blocks from "./Blocks";
import { Block } from "../../../../lib/blockchain";

describe("The block explorer page", () => {
  let blocks: Block[];
  beforeAll(() => {
    const transactions = [
      {
        // output 100 to 'address1' and 'address2'
        txid: "txid1",
        inputs: [],
        outputs: [
          {
            address: "address1",
            amount: 100,
            index: 0,
          },
          {
            address: "address2",
            amount: 100,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // output 100 to 'address3' and 'address4'
        txid: "txid2",
        inputs: [],
        outputs: [
          {
            address: "address3",
            amount: 100,
            index: 0,
          },
          {
            address: "address4",
            amount: 100,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 50 from 'address1' to 'address2', spending 'address1s' original output
        // & returning change to 'address1' in new output
        txid: "txid3",
        inputs: [
          {
            txid: "txid1",
            outputIndex: 0,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address2",
            amount: 50,
            index: 0,
          },
          {
            address: "address1",
            amount: 50,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 50 from 'address3' to 'address4', spending 'address4s' original output
        // & returning change to 'address3' in new output
        txid: "txid4",
        inputs: [
          {
            txid: "txid2",
            outputIndex: 0,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address4",
            amount: 50,
            index: 0,
          },
          {
            address: "address3",
            amount: 50,
            index: 1,
          },
        ],
        timestamp: Date.now(),
      },
    ];
    blocks = [
      {
        minerAddress: "miner1",
        hash: "hash1",
        prevHash: "hash1",
        nonce: 1,
        txs: [transactions[0], transactions[1]],
        timestamp: Date.now(),
        difficulty: 1,
      },
      {
        minerAddress: "miner2",
        hash: "hash2",
        prevHash: "hash2",
        nonce: 2,
        txs: [transactions[2], transactions[3]],
        timestamp: Date.now(),
        difficulty: 2,
      },
    ];
  });
  it("displays blocks in reverse order with the height, time, hash and number of transactions of each block", () => {
    render(
      <BrowserRouter>
        <Blocks blocks={blocks} />
      </BrowserRouter>
    );
    const blockComponents = screen.getAllByRole("row");
    expect(blockComponents).toHaveLength(blocks.length + 1); // + 1 for table header row
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[blocks.length - i - 1];
      const blockRow = blockComponents[i + 1];
      expect(blockRow.children).toHaveLength(4);
      const height = blockRow.children.item(0);
      const time = blockRow.children.item(1);
      const hash = blockRow.children.item(2);
      const txCount = blockRow.children.item(3);
      if (height && time && hash && txCount) {
        expect(height.textContent).toContain(`${blocks.length - i - 1}`);
        expect(time.textContent).toContain(
          new Date(block.timestamp).toLocaleTimeString()
        );
        expect(hash.textContent).toContain(block.hash);
        expect(txCount.textContent).toContain(block.txs.length.toString());
      }
    }
  });

  it("displays the full transaction details when the user navigates to transactions/:txid", async () => {
    const history = createMemoryHistory();
    history.push(`/blocks/${blocks[0].hash}`);
    render(
      <Router location={history.location} navigator={history}>
        <Routes>
          <Route path="/blocks/:hash" element={<Blocks blocks={blocks} />} />
        </Routes>
      </Router>
    );
    await screen.findByTestId("BlockModal");
  });
});
