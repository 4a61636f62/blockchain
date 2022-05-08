export abstract class WsClient<T> {
  private wsc!: Promise<WebSocket>;

  private handleMessages!: (messages: T) => void;

  connect(): Promise<WebSocket> {
    this.wsc = new Promise((resolve, reject) => {
      const ws = new WebSocket("ws://localhost:3000");
      ws.addEventListener("open", () => resolve(ws));
      ws.addEventListener("error", (err) => reject(err));
      ws.addEventListener("message", this.onMessageReceived);
    });
    return this.wsc;
  }

  setHandleMessages(fn: (message: T) => void): void {
    this.handleMessages = fn;
  }

  private readonly onMessageReceived = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as T;
    this.handleMessages(message);
  };

  disconnect() {
    this.wsc.then((ws) => ws.close());
  }

  send(message: T) {
    this.wsc.then((ws) => ws.send(JSON.stringify(message)));
  }
}
