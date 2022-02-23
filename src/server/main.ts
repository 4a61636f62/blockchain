import express from "express";
import http from "http";
import path from "path";
import { BlockchainServer } from "./blockchain-server";

const PORT = 3000;
const app = express();
app.use("/", express.static(path.join(__dirname, "../client/public")));
app.use(
  "/node_modules",
  express.static(path.join(__dirname, "../../node_modules"))
);

const httpServer: http.Server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${PORT}`);
  }
});

// eslint-disable-next-line no-new
new BlockchainServer(httpServer);
