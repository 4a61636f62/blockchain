import React from "react";
import {Button, Container, Group, NumberInput, TextInput, Title} from "@mantine/core";
import {useBlockchainClient} from "../BlockchainContext";
import {useForm} from "@mantine/hooks";
import {blockchainAddress} from "../../../blockchain/wallet";

export const Wallet = () => {
    const {state, dispatch} = useBlockchainClient()
    const form = useForm({
        initialValues: {
            address: '',
            amount: 0
        }
    })

    const onSubmit = (address: blockchainAddress, amount: number) => {
        const transaction = state.wallet.createTransaction(address, amount, state.blocks)
        if (transaction !== null) {
            dispatch({type: "add-transaction", transaction})
            dispatch({type: "send-transaction-announcement", transaction})
            form.reset()
        }
    }
    return (
        <Container>
            <Title order={3}>Wallet</Title>
            <form onSubmit={form.onSubmit(values => onSubmit(values.address, values.amount))}>
                <Group direction="column">
                    <TextInput
                        required
                        label={"Address"}
                        {...form.getInputProps('address')}
                    />
                    <NumberInput
                        required
                        label={"Amount"}
                        {...form.getInputProps('amount')}
                    />
                    <Button type="submit">
                        Create Transaction
                    </Button>
                </Group>

            </form>
        </Container>)
}
