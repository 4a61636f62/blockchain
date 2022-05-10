import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import TransactionPanel from "./TransactionPanel";
import { Transaction } from "../../../../../lib/blockchain";

class ResizeObserver {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}
}

describe("the transactions panel", () => {
  let transactions: Transaction[];

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;

    transactions = [
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
  });
  it("displays the txid, time created and amount of each transaction", () => {
    render(
      <BrowserRouter>
        <TransactionPanel transactions={transactions} />
      </BrowserRouter>
    );
    transactions.forEach((tx) => {
      const txComponent = screen.getByTestId(tx.txid);
      expect(txComponent.textContent).toContain(tx.txid);
      expect(txComponent.textContent).toContain(
        new Date(tx.timestamp).toLocaleTimeString()
      );
      expect(txComponent.textContent).toContain(
        tx.outputs[0].amount.toString()
      );
    });
  });

  it("allows the user to click the txid to view the full details of the transaction on the transactions page", () => {});
});
