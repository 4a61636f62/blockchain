import React from "react";
import { Button, Container, Group, NumberInput, Switch } from "@mantine/core";

function SimulationControl() {
  return (
    <Container>
      <Group>
        <NumberInput defaultValue={10} label="No. of nodes" />
        <NumberInput defaultValue={10} label="Mining Difficulty" />
        <Switch label="Auto UnconfirmedTransactions" />
        <Button>Start</Button>
      </Group>
    </Container>
  );
}

export default SimulationControl;
