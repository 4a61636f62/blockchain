import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import BlockPanel from "./BlockPanel";
import { Block } from "../../../../../lib/blockchain";

class ResizeObserver {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}
}

describe("the blocks panel", () => {
  let blocks: Block[];
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;
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

  it("displays the time mined, hash, prev hash, number of transactions and nonce for each block", () => {
    render(
      <BrowserRouter>
        <BlockPanel blocks={blocks} mine={false} />
      </BrowserRouter>
    );
    blocks.forEach((b, index) => {
      const blockComponent = screen.getByTestId(`Block ${index}`);
      expect(blockComponent.textContent).toContain(
        new Date(b.timestamp).toLocaleTimeString()
      );
      expect(blockComponent.textContent).toContain(b.hash.slice(0, 5));
      expect(blockComponent.textContent).toContain(b.prevHash.slice(0, 5));
      expect(blockComponent.textContent).toContain(
        `Transactions: ${b.txs.length}`
      );
      expect(blockComponent.textContent).toContain(`Nonce: ${b.nonce}`);
    });
  });
});
