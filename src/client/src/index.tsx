import React from "react";
import ReactDOM from "react-dom";

import App from "client/src/components/App";
import { BlockchainProvider } from "client/src/components/BlockchainContext";

ReactDOM.render(
  <BlockchainProvider>
    <App />
  </BlockchainProvider>,
  document.getElementById("root")
);
