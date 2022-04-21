/* eslint-disable react/jsx-props-no-spreading */
import React, { SetStateAction } from "react";
import { Button, Container, Group, NumberInput, Switch } from "@mantine/core";
import { useForm } from "@mantine/hooks";

function SimulationControl({
  running,
  setRunning,
  autoTx,
  setAutoTx,
  createSimulation,
  canStart,
}: {
  running: boolean;
  setRunning: React.Dispatch<SetStateAction<boolean>>;
  autoTx: boolean;
  setAutoTx: React.Dispatch<SetStateAction<boolean>>;
  createSimulation: (noOfNodes: number, miningDifficulty: number) => void;
  canStart: boolean;
}) {
  const form = useForm({
    initialValues: {
      nodes: 10,
      difficulty: 3,
    },
    validationRules: {
      nodes: (n) => n > 0 && n < 50,
      difficulty: (d) => d > 0 && d < 10,
    },
  });

  const create = form.onSubmit(({ difficulty, nodes }) => {
    createSimulation(nodes, difficulty);
    setRunning(false);
  });

  return (
    <Container>
      <form onSubmit={create}>
        <Group>
          <NumberInput
            label="No. of nodes"
            {...form.getInputProps("nodes")}
            disabled={running}
          />
          <NumberInput
            label="Mining Difficulty"
            {...form.getInputProps("difficulty")}
            disabled={running}
          />
          <Switch
            label="Auto Transactions"
            checked={autoTx}
            onChange={(e) => setAutoTx(e.currentTarget.checked)}
          />
          <Button type="submit" disabled={running}>
            New
          </Button>
          {running ? (
            <Button
              onClick={() => {
                setRunning(false);
              }}
              color="red"
            >
              Stop
            </Button>
          ) : (
            <Button
              onClick={() => {
                setRunning(true);
              }}
              disabled={!canStart}
            >
              Start
            </Button>
          )}
        </Group>
      </form>
    </Container>
  );
}

export default SimulationControl;
