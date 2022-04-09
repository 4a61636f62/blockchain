import React from "react";
import {
  Button,
  Container,
  Grid,
  Group,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

function Wallet() {
  const balance = 100;
  const unconfirmed = 10;
  // @ts-ignore
  return (
    <Container>
      <Title>Wallet</Title>
      <Grid>
        <Grid.Col span={6}>
          <Title order={6}>Address</Title>
          <Text>asdfasdfasdfasdfasdfasdfasdfasdf</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Title order={6}>Balance</Title>
          <Text>
            {
              balance + unconfirmed
              // (unconfirmed === 0 ? "" : ` (${unconfirmed} unconfirmed)`)
            }
          </Text>
        </Grid.Col>
        <Grid.Col span={3} />
        <Grid.Col span={6}>
          <form>
            <Group direction="column">
              <Title order={4}>Create Transaction</Title>
              <TextInput required label="Address" />
              <NumberInput required label="Amount" />
              <Button type="submit">Send</Button>
            </Group>
          </form>
        </Grid.Col>
        <Grid.Col span={6} />
        <Grid.Col span={3} />
      </Grid>
    </Container>
  );
}

export default Wallet;
