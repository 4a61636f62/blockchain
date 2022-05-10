import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import SimulationControl from "./SimulationControl";

describe("the simulation control panel", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("allows the user to create a new simulation", async () => {
    const create = jest.fn();
    render(
      <SimulationControl
        running={false}
        setRunning={() => {}}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={create}
        canStart={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "New" }));
    expect(create).toHaveBeenCalledWith(10, 3); // default values
  });

  it("allows the user to set the number of simulated nodes", async () => {
    const create = jest.fn();
    render(
      <SimulationControl
        running={false}
        setRunning={() => {}}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={create}
        canStart={false}
      />
    );

    const nodesInput = screen.getByLabelText("No. of nodes");

    await user.clear(nodesInput);
    await user.type(nodesInput, "5");
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(create).toHaveBeenCalledWith(5, 3); // user defined value for no. of nodes, default for difficulty
  });

  it("allows the user to set the mining difficulty", async () => {
    const create = jest.fn();
    render(
      <SimulationControl
        running={false}
        setRunning={() => {}}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={create}
        canStart={false}
      />
    );

    const difficultyInput = screen.getByLabelText("Mining Difficulty");

    await user.clear(difficultyInput);
    await user.type(difficultyInput, "1");
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(create).toHaveBeenCalledWith(10, 1); // user defined value for difficulty, default for no. of nodes
  });

  it("allows the user to enable and disable automatic transactions when simulation is not running", async () => {
    const setAutoTx = jest.fn();
    const { rerender } = render(
      <SimulationControl
        running={false}
        setRunning={() => {}}
        autoTx={false}
        setAutoTx={setAutoTx}
        createSimulation={() => {}}
        canStart={false}
      />
    );
    await user.click(screen.getByLabelText("Auto Transactions"));
    expect(setAutoTx).toHaveBeenLastCalledWith(true);

    rerender(
      <SimulationControl
        running={false}
        setRunning={() => {}}
        autoTx
        setAutoTx={setAutoTx}
        createSimulation={() => {}}
        canStart={false}
      />
    );
    await user.click(screen.getByLabelText("Auto Transactions"));
    expect(setAutoTx).toHaveBeenLastCalledWith(false);
  });

  it("allows the user to start and stop the simulation", async () => {
    const setRunning = jest.fn();
    const { rerender } = render(
      <SimulationControl
        running={false}
        setRunning={setRunning}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={() => {}}
        canStart={false}
      />
    );
    await user.click(screen.getByRole("button", { name: "New" }));
    rerender(
      <SimulationControl
        running={false}
        setRunning={setRunning}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={() => {}}
        canStart
      />
    );
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(setRunning).toHaveBeenLastCalledWith(true);

    rerender(
      <SimulationControl
        running
        setRunning={setRunning}
        autoTx={false}
        setAutoTx={() => {}}
        createSimulation={() => {}}
        canStart
      />
    );
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(setRunning).toHaveBeenLastCalledWith(false);
  });
});
