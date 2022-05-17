/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import React from "react";
import {
  Button,
  Center,
  Group,
  NativeSelect,
  NumberInput,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import * as Blockchain from "../../../../../lib/blockchain";

function TransactionForm({
  createTransaction,
  nodes,
  closeForm,
  balance,
  unconfirmedBalance,
}: {
  createTransaction: (toAddress: string, amount: number) => boolean;
  nodes?: Map<string, Blockchain.Wallet>;
  closeForm?: () => void;
  balance: number | undefined;
  unconfirmedBalance: number | undefined;
}) {
  const validateAmount = (amount: number) => {
    if (amount <= 0) {
      return "Must be greater than 0";
    }
    if (
      !balance ||
      amount > balance ||
      (balance && unconfirmedBalance && amount > balance + unconfirmedBalance)
    ) {
      return "Insufficient Balance";
    }
    return null;
  };

  const form = useForm({
    initialValues: {
      sendTo: "",
      amount: 0,
    },
    validate: {
      amount: validateAmount,
    },
  });

  const create = form.onSubmit(({ sendTo, amount }) => {
    let addressToUse = sendTo;
    if (typeof nodes !== "undefined") {
      const node = nodes.get(sendTo);
      if (typeof node !== "undefined") {
        addressToUse = node.address;
      }
    }
    if (createTransaction(addressToUse, amount)) {
      if (closeForm) closeForm();
      return true;
    }
    return false;
  });

  return (
    <form onSubmit={create}>
      <Center>
        <Group direction="column">
          <Title order={4}>Create Transaction</Title>
          {typeof nodes !== "undefined" ? (
            <NativeSelect
              required
              label="Address"
              {...form.getInputProps("sendTo")}
              data={Array.from(nodes.keys())}
            />
          ) : (
            <TextInput
              required
              label="Address"
              {...form.getInputProps("sendTo")}
            />
          )}

          <NumberInput
            required
            label="Amount"
            {...form.getInputProps("amount")}
          />
          <Button type="submit">Send</Button>
        </Group>
      </Center>
    </form>
  );
}

export default TransactionForm;
