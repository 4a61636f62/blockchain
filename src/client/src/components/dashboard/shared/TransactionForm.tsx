/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import React from "react";
import {
  Button,
  Group,
  NumberInput,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";

function TransactionForm({
  createTransaction,
  nodeList,
  closeForm,
  balance,
  unconfirmedBalance,
}: {
  createTransaction: (toAddress: string, amount: number) => boolean;
  nodeList?: { value: string; label: string }[];
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
      address: "",
      amount: 0,
    },
    validate: {
      amount: validateAmount,
    },
  });

  const create = form.onSubmit(({ address, amount }) => {
    if (createTransaction(address, amount)) {
      if (closeForm) closeForm();
      return true;
    }
    return false;
  });

  return (
    <form onSubmit={create}>
      <Group direction="column">
        <Title order={4}>Create Transaction</Title>
        {typeof nodeList !== "undefined" ? (
          <Select
            required
            label="Address"
            {...form.getInputProps("address")}
            data={nodeList}
          />
        ) : (
          <TextInput
            required
            label="Address"
            {...form.getInputProps("address")}
          />
        )}

        <NumberInput
          required
          label="Amount"
          {...form.getInputProps("amount")}
        />
        <Button type="submit">Send</Button>
      </Group>
    </form>
  );
}

export default TransactionForm;
