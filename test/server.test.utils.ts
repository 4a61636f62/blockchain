import WebSocket, { Data } from "ws";
import http, {Server} from "http";
import {BlockchainServer} from "../src/server/blockchain-server";

function startServer(port: number): Promise<Server> {
  const server = http.createServer();
  new BlockchainServer(server)
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

function waitForSocketState(socket: WebSocket, state: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    });
  });
}

type SocketData = [WebSocket, Data[]]
async function createSocketClient(port: number, closeAfter: number): Promise<SocketData>
async function createSocketClient(port: number, closeAfter?: number): Promise<SocketData> {
  const client = new WebSocket(`ws://localhost:${port}`);
  await waitForSocketState(client, client.OPEN);
  const messages: WebSocket.Data[] = [];

  client.on("message", (data) => {
    messages.push(data);

    if (messages.length === closeAfter) {
      client.close();
    }
  });

  return [client, messages];
}
export { startServer, waitForSocketState, createSocketClient };