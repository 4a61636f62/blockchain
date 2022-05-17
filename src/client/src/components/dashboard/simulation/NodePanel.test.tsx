import { getByRole, render, screen } from "@testing-library/react";
import React from "react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import userEvent from "@testing-library/user-event";
import { Wallet } from "../../../../../lib/blockchain";
import NodePanel from "./NodePanel";

class ResizeObserver {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}
}

describe("the nodes panel", () => {
  let user: UserEvent;
  const nodes: Map<string, Wallet> = new Map();
  const balances: Map<string, number> = new Map();
  const unconfirmedBalances: Map<string, number> = new Map();

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;
    for (let i = 1; i <= 10; i += 1) {
      const wallet = new Wallet();
      nodes.set(`Node ${i}`, wallet);
      balances.set(wallet.address, 100 + i);
    }

    const node1 = nodes.get("Node 1");
    const node2 = nodes.get("Node 2");

    if (typeof node1 !== "undefined" && typeof node2 !== "undefined") {
      unconfirmedBalances.set(node1.address, -10);
      unconfirmedBalances.set(node2.address, 10);
    }
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("displays the name, address and balance for each the nodes", () => {
    const createTransactions = jest.fn();
    render(
      <NodePanel
        nodes={nodes}
        balances={balances}
        unconfirmedBalances={unconfirmedBalances}
        mineBlock={() => {}}
        createTransaction={createTransactions}
        running={false}
      />
    );
    const nodeEntries = Array.from(nodes.entries());
    nodeEntries.forEach(([name, wallet]) => {
      const nodeComponent = screen.getByTestId(name);
      expect(nodeComponent.textContent).toContain(wallet.address.slice(0, 5));
      const balance = balances.get(wallet.address);
      if (typeof balance !== "undefined") {
        expect(nodeComponent.textContent).toContain(`Balance: ${balance}`);
      } else {
        expect(nodeComponent.textContent).toContain(`Balance: 0`);
      }
      const unconfirmedBalance = unconfirmedBalances.get(wallet.address);
      if (typeof unconfirmedBalance !== "undefined") {
        expect(nodeComponent.textContent).toContain(
          `${unconfirmedBalance} unconfirmed`
        );
      }
    });
  });

  it("opens the create transaction form when the user clicks the Transaction button next to a node", async () => {
    const createTransactions = jest.fn();
    render(
      <NodePanel
        nodes={nodes}
        balances={balances}
        unconfirmedBalances={unconfirmedBalances}
        mineBlock={() => {}}
        createTransaction={createTransactions}
        running={false}
      />
    );

    const node1Component = screen.getByTestId("Node 1");
    const txButton = getByRole(node1Component, "button", {
      name: "Transaction",
    });

    await user.click(txButton);

    expect(screen.getByText("Create Transaction"));
    expect(screen.getByRole("combobox", { name: "Address *" }));
    expect(screen.getByRole("textbox", { name: "Amount *" }));
  });

  it("allows the user to mine a block with a node", async () => {
    const createTransactions = jest.fn();
    const mine = jest.fn();
    render(
      <NodePanel
        nodes={nodes}
        balances={balances}
        unconfirmedBalances={unconfirmedBalances}
        mineBlock={mine}
        createTransaction={createTransactions}
        running={false}
      />
    );

    const node1 = nodes.get("Node 1");

    const node1Component = screen.getByTestId("Node 1");
    const mineButton = getByRole(node1Component, "button", {
      name: "Mine",
    });

    await user.click(mineButton);
    if (typeof node1 !== "undefined")
      expect(mine).toHaveBeenCalledWith(node1.address);
  });
});
