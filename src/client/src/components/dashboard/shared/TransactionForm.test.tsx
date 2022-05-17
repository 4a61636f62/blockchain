import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import TransactionForm from "./TransactionForm";

describe("the create transaction form", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("allows the user to create a transaction", async () => {
    const create = jest.fn();
    render(
      <TransactionForm
        createTransaction={create}
        balance={100}
        unconfirmedBalance={0}
      />
    );
    const addressField = screen.getByRole("textbox", { name: "Address *" });
    await user.type(addressField, "Node 2");
    const amountField = screen.getByRole("textbox", { name: "Amount *" });
    await user.type(amountField, "100");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(create).toHaveBeenCalled();
  });
});
