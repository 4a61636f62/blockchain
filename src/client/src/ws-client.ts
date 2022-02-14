export abstract class WsClient<T> {
    private wsc!: Promise<WebSocket>
    private messagesCallback!: (messages: T) => void

    connect(messagesCallback: (message: T) => void): Promise<WebSocket> {
        this.messagesCallback = messagesCallback
        return this.wsc = new Promise((resolve, reject) => {
            const ws = new WebSocket("ws://localhost:3000")
            ws.addEventListener("open", () => resolve(ws))
            ws.addEventListener("error", err => reject(err))
            ws.addEventListener("message", this.onMessageReceived)
        })
    }

    disconnect() {
        this.wsc.then(ws => ws.close())
    }

    private readonly onMessageReceived = (event: MessageEvent) => {
        const message = JSON.parse(event.data) as T
        // need to check if message correlates to message awaiting reply
        this.messagesCallback(message)
    }

    send(message: T) {
        this.wsc.then(
            ws => ws.send(JSON.stringify(message))
        )
    }
}