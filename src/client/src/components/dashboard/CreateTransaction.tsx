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
import { useForm } from "@mantine/hooks";

function CreateTransaction({
  createTransaction,
  nodeList,
  closeForm,
}: {
  createTransaction: (toAddress: string, amount: number) => boolean;
  nodeList?: { value: string; label: string }[];
  closeForm?: () => void;
}) {
  const form = useForm({
    initialValues: {
      address: "",
      amount: 0,
    },
    validationRules: {
      amount: (a) => a > 0,
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

export default CreateTransaction;
