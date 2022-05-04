import React, { useState } from "react";
import {
  Anchor,
  AppShell,
  Button,
  Center,
  Group,
  Header,
  Navbar,
  Title,
  Text,
} from "@mantine/core";
import { Link } from "react-router-dom";
import Simulation from "./dashboard/simulation/Simulation";
import Live from "./dashboard/live/Live";
import { BlockchainProvider } from "./dashboard/live/BlockchainContext";

type Network = "Sim" | "Live";
function App() {
  const [network, setNetwork] = useState<Network>("Sim");
  return (
    <AppShell
      navbar={
        <Navbar width={{ base: 300 }} height={500}>
          <Navbar.Section>
            <Center>
              <Text>Network</Text>
            </Center>
            <Center>
              <Button
                style={{ width: 110 }}
                disabled={network === "Sim"}
                onClick={() => setNetwork("Sim")}
              >
                Simulated
              </Button>
              <Button
                style={{ width: 110 }}
                disabled={network === "Live"}
                onClick={() => setNetwork("Live")}
              >
                Live
              </Button>
            </Center>
          </Navbar.Section>
          <Navbar.Section grow mt="md">
            <Center>
              <Group direction="column" spacing="xl">
                <Anchor component={Link} to="/">
                  Dashboard
                </Anchor>
                <Anchor component={Link} to="blocks">
                  Block Explorer
                </Anchor>
                <Anchor component={Link} to="transactions">
                  Transactions
                </Anchor>
              </Group>
            </Center>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={80}>
          <Center>
            <Title>Blockchain</Title>
          </Center>
        </Header>
      }
    >
      {network === "Sim" ? (
        <Simulation />
      ) : (
        <BlockchainProvider>
          <Live />
        </BlockchainProvider>
      )}
    </AppShell>
  );
}

export default App;
