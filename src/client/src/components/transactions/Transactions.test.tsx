import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Router, Routes } from "react-router-dom";
import React from "react";
import { createMemoryHistory } from "history";
import Transactions from "./Transactions";
import { Transaction } from "../../../../lib/blockchain";

describe("the transactions page", () => {
  let transactions: Transaction[];
  let unconfirmedTransactions: Transaction[];
  beforeAll(() => {
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

    unconfirmedTransactions = [
      {
        // transfer 50 from 'address1' to 'address2' spending 'address1's output from txid3
        txid: "txid5",
        inputs: [
          {
            txid: "txid3",
            outputIndex: 1,
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
        ],
        timestamp: Date.now(),
      },
      {
        // transfer 100 from 'address4' to 'address3' spending 'address4's output from txid2
        txid: "txid6",
        inputs: [
          {
            txid: "txid2",
            outputIndex: 1,
            signature: {
              r: "r",
              s: "s",
              recoveryParam: 0,
            },
          },
        ],
        outputs: [
          {
            address: "address3",
            amount: 100,
            index: 0,
          },
        ],
        timestamp: Date.now(),
      },
    ];
  });

  it("displays all transactions in reverse order with txid, number of inputs and number of outputs of each transaction", () => {
    render(
      <MemoryRouter>
        <Transactions
          confirmed={transactions}
          unconfirmed={unconfirmedTransactions}
        />
      </MemoryRouter>
    );
    const allTransactions = [
      ...unconfirmedTransactions.reverse(),
      ...transactions.reverse(),
    ];
    const txComponents = screen.getAllByRole("row");
    expect(txComponents).toHaveLength(allTransactions.length + 1); // + 1 for table header row
    for (let i = 0; i < allTransactions.length; i += 1) {
      const tx = allTransactions[i];
      const txRow = txComponents[i + 1];
      expect(txRow.children).toHaveLength(3);
      const txid = txRow.children.item(0);
      const inputCount = txRow.children.item(1);
      const outputCount = txRow.children.item(2);
      if (txid && inputCount && outputCount) {
        expect(txid.textContent).toContain(tx.txid);
        expect(inputCount.textContent).toContain(`${tx.inputs.length}`);
        expect(outputCount.textContent).toContain(`${tx.outputs.length}`);
      }
    }
  });

  it("displays the full transaction details when the user navigates to transactions/:txid", async () => {
    const history = createMemoryHistory();
    history.push(`/transactions/${transactions[0].txid}`);
    render(
      <Router location={history.location} navigator={history}>
        <Routes>
          <Route
            path="/transactions/:txid"
            element={
              <Transactions
                confirmed={transactions}
                unconfirmed={unconfirmedTransactions}
              />
            }
          />
        </Routes>
      </Router>
    );
    await screen.findByTestId("TransactionModal");
  });
});
