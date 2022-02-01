import {Node} from "../src/blockchain/blockchain-node"
import {createSocketClient, startServer, waitForSocketState} from "./server.test.utils";
import {Server} from "http";
import {Message, MessageTypes} from "../src/lib/message";

const port = 3000

describe("WebSocket Server", () => {
    let server: Server

    beforeAll(async () => {
        server = await startServer(port)
    })

    afterAll(() => {
        server.close()
    })

    test("Blocks can be broadcast from one client to all other clients", async () => {
        const [client1] = await createSocketClient(port, 1)
        const [client2, messages2] = await createSocketClient(port, 1)
        const n = new Node()

        await n.startChain()
        const b = n.chain.lastBlock
        const m: Message = {
            correlationId: "1",
            type: MessageTypes.NewBlockAnnouncement,
            payload: b
        }

        client1.send(JSON.stringify(m))
        await waitForSocketState(client2, client2.CLOSED)
        const [rm] = messages2
        const b2 = JSON.parse(rm.toString()).payload

        expect(b2).toEqual(b)
    })
})