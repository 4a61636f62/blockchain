import React from "react";
import {
  cleanup,
  getAllByRole,
  getByRole,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import { MemoryRouter } from "react-router-dom";
import Simulation from "./Simulation";

class ResizeObserver {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}
}

describe("The simulation dashboard", () => {
  let user: UserEvent;
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;
  });

  beforeEach(() => {
    user = userEvent.setup();
    render(
      <MemoryRouter>
        <Simulation />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("allows the user to create a new simulation and displays the correct number of nodes", async () => {
    const nodesInput = screen.getByLabelText("No. of nodes");
    await user.clear(nodesInput);
    await user.type(nodesInput, "5");
    await user.click(screen.getByRole("button", { name: "New" }));

    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByTestId(`Node ${i}`));
    }
  });

  it("allows the user to mine blocks", async () => {
    await user.click(screen.getByRole("button", { name: "New" }));

    const nodeMineButtons = screen.getAllByRole("button", { name: "Mine" });
    user.click(nodeMineButtons[0]);

    const genesisBlock = await screen.findByTestId("Block 0");
    expect(genesisBlock);
    if (genesisBlock) {
      expect(genesisBlock.textContent).toContain("Hash:");
      expect(genesisBlock.textContent).not.toContain("Prev Hash:");
      expect(genesisBlock.textContent).toContain("Transactions: 1");
      expect(genesisBlock.textContent).toContain("Nonce:");
    }

    user.click(nodeMineButtons[0]);

    const block1 = await screen.findByTestId("Block 1");
    expect(block1);
    if (block1) {
      expect(block1.textContent).toContain("Hash:");
      expect(block1.textContent).toContain("Prev Hash:");
      expect(block1.textContent).toContain("Transactions: 1");
      expect(block1.textContent).toContain("Nonce:");
    }
  });

  it("updates node balances when the user mine a block", async () => {
    await user.click(screen.getByRole("button", { name: "New" }));
    const node1 = screen.getByTestId("Node 1");
    expect(node1.textContent).toContain("Balance: 0");
    const node1Mine = getByRole(node1, "button", { name: "Mine" });
    await user.click(node1Mine);
    expect(node1.textContent).toContain("Balance: 100");
  });

  it("creates and renders a new transaction when the user opens and fills out the transaction form", async () => {
    await user.click(screen.getByRole("button", { name: "New" }));
    const node1 = screen.getByTestId("Node 1");
    const node1Mine = getByRole(node1, "button", { name: "Mine" });
    await user.click(node1Mine);
    const node1Transaction = getByRole(node1, "button", {
      name: "Transaction",
    });
    await user.click(node1Transaction);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Address *" }),
      screen.getByRole("option", { name: "Node 2" })
    );
    await user.type(screen.getByRole("textbox", { name: "Amount *" }), "100");
    await user.click(screen.getByRole("button", { name: "Send" }));

    let transactions = screen.getByTestId("transactions");
    let txids = getAllByRole(transactions, "link");
    expect(txids.length).toEqual(1);

    await user.click(screen.getByRole("button", { name: "New" }));
    const node3 = screen.getByTestId("Node 1");
    const node3Mine = getByRole(node3, "button", { name: "Mine" });
    await user.click(node3Mine);
    const node3Transaction = getByRole(node3, "button", {
      name: "Transaction",
    });
    await user.click(node3Transaction);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Address *" }),
      screen.getByRole("option", { name: "Node 2" })
    );
    await user.type(screen.getByRole("textbox", { name: "Amount *" }), "100");
    await user.click(screen.getByRole("button", { name: "Send" }));

    transactions = screen.getByTestId("transactions");
    txids = getAllByRole(transactions, "link");

    expect(txids.length).toEqual(1);
  }, 20000);

  it("updates node unconfirmed balances when a user creates a transaction", async () => {
    await user.click(screen.getByRole("button", { name: "New" }));
    const node1 = screen.getByTestId("Node 1");
    const node2 = screen.getByTestId("Node 2");
    expect(node1.textContent).toContain("Balance: 0");
    expect(node1.textContent).not.toContain("unconfirmed");
    expect(node2.textContent).toContain("Balance: 0");
    expect(node2.textContent).not.toContain("unconfirmed");
    const node1Mine = getByRole(node1, "button", { name: "Mine" });
    await user.click(node1Mine);
    expect(node1.textContent).toContain("Balance: 100");
    expect(node1.textContent).not.toContain("unconfirmed");
    const node1Transaction = getByRole(node1, "button", {
      name: "Transaction",
    });
    await user.click(node1Transaction);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Address *" }),
      screen.getByRole("option", { name: "Node 2" })
    );
    await user.type(screen.getByRole("textbox", { name: "Amount *" }), "100");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(node1.textContent).toContain("Balance: 100  [-100 unconfirmed]");
    expect(node2.textContent).toContain("Balance: 0  [+100 unconfirmed]");
  }, 10000);

  it("includes unconfirmed transactions in the next mined block", async () => {
    await user.click(screen.getByRole("button", { name: "New" }));
    const node1 = screen.getByTestId("Node 1");
    const node1Mine = getByRole(node1, "button", { name: "Mine" });
    await user.click(node1Mine);

    const node1Transaction = getByRole(node1, "button", {
      name: "Transaction",
    });
    await user.click(node1Transaction);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Address *" }),
      screen.getByRole("option", { name: "Node 2" })
    );
    await user.type(screen.getByRole("textbox", { name: "Amount *" }), "100");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await user.click(node1Mine);
    const block1 = await screen.findByTestId("Block 1");
    expect(block1.textContent).toContain("Transactions: 2");
  }, 10000);
});
