import WebSocket from "ws";
import { Server } from "http"

export abstract class WsServer<T> {
    private wss: WebSocket.Server

    constructor(server: Server) {
        this.wss = new WebSocket.Server({server})
        this.wss.on("connection", this.subscribe)
        this.wss.on("close", this.cleanup)
    }

    protected abstract handleMessage(sender: WebSocket, message: T): void

    protected readonly subscribe = (ws: WebSocket): void => {
        ws.on('message', (data: WebSocket.Data) => {
            this.handleMessage(ws, JSON.parse(data.toString()))
        })
    }

    protected readonly cleanup = (): void => {
        this.wss.clients.forEach(client => {
            if (!WsServer.isAlive(client)) {
                this.wss.clients.delete(client)
            }
        })
    }

    protected broadcastFrom(sender: WebSocket, message: T): number {
        let sentTo = 0
        this.wss.clients.forEach(client => {
            if (WsServer.isAlive(client) && client !== sender) {
                client.send(JSON.stringify(message))
                sentTo++
            }
        })
        return sentTo
    }

    protected sendTo(client: WebSocket, message: T): void {
        client.send(JSON.stringify(message))
    }

    private static isAlive(client: WebSocket): boolean {
        return (client.readyState !== WebSocket.CLOSING && client.readyState !== WebSocket.CLOSED)
    }

    protected get clients(): Set<WebSocket> {
        return this.wss.clients
    }
}