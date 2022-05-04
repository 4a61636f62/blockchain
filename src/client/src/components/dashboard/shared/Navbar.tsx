import React from "react";
import { Anchor, Button, Center, Group, Navbar, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function NavigationBar({
  network,
  setNetwork,
}: {
  network: string;
  setNetwork: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Navbar width={{ base: 200 }} height={500}>
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
  );
}
