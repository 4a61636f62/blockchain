import React from "react";
import {Button, Container, Grid, Group, NumberInput, Text, TextInput, Title} from "@mantine/core";
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

    const [balance, unconfirmed] = state.wallet.getBalance(state.blocks, state.transactions)


    return (
        <Container>
            <Title order={3}>Wallet</Title>
            <Grid>
                <Grid.Col span={6}>
                    <Title order={6}>Address</Title>
                    <Text>{state.wallet.address}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Title order={6}>Balance</Title>
                    <Text>{balance + (unconfirmed == 0 ? '' : ` (${unconfirmed} unconfirmed)`)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <form onSubmit={form.onSubmit(values => onSubmit(values.address, values.amount))}>
                        <Group direction={"column"}>
                            <Title order={4}>Create Transaction</Title>
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
                                Send
                            </Button>
                        </Group>
                    </form>
                </Grid.Col>
                <Grid.Col span={6}>

                </Grid.Col>
            </Grid>
        </Container>)
}

// <Container>
//     <Title order={3}>Wallet</Title>
//     <Text>{state.wallet.address}</Text>
//     <form onSubmit={form.onSubmit(values => onSubmit(values.address, values.amount))}>
//         <Group direction="column">
//             <TextInput
//                 required
//                 label={"Address"}
//                 {...form.getInputProps('address')}
//             />
//             <NumberInput
//                 required
//                 label={"Amount"}
//                 {...form.getInputProps('amount')}
//             />
//             <Button type="submit">
//                 Create Transaction
//             </Button>
//         </Group>
//
//     </form>
// </Container>)
