import React, { useState } from "react";
import {
  AppShell,
  Center,
  Header,
  Title,
  MediaQuery,
  Burger,
  Navbar,
  Text,
  Button,
  Group,
  Anchor,
} from "@mantine/core";
import { Link } from "react-router-dom";
import Simulation from "./dashboard/simulation/Simulation";
import LiveOLD from "./dashboard/live/Live";

function App() {
  const [network, setNetwork] = useState<string>("Sim");
  const [hideNavbar, setHideNavbar] = useState(true);
  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      fixed
      navbar={
        <Navbar
          width={{ sm: 200, lg: 300 }}
          height={500}
          hiddenBreakpoint="sm"
          hidden={hideNavbar}
        >
          <Navbar.Section>
            <Center>
              <Text>Network</Text>
            </Center>
            <Center>
              <Button
                style={{ width: 80 }}
                disabled={network === "Sim"}
                onClick={() => setNetwork("Sim")}
                size="xs"
              >
                Sim
              </Button>
              <Button
                style={{ width: 80 }}
                disabled={network === "Live"}
                onClick={() => setNetwork("Live")}
                size="xs"
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
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={!hideNavbar}
              onClick={() => setHideNavbar((x) => !x)}
              size="sm"
              mr="xl"
            />
          </MediaQuery>
          <Center>
            <Title>Blockchain</Title>
          </Center>
        </Header>
      }
    >
      {network === "Sim" ? <Simulation /> : <LiveOLD />}
    </AppShell>
  );
}

export default App;
