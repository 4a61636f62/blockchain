import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { Message, MessageTypes } from "lib/message";
import { Wallet } from "lib/wallet";
import { BlockchainClient } from "client/src/services/blockchain-client";
import { reducer, State, Action } from "client/src/utils/reducers";

type Dispatch = (action: Action) => void;
type ComponentProps = { children: React.ReactNode };

const BlockchainContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function BlockchainProvider({ children }: ComponentProps) {
  const [state, dispatch] = useReducer(reducer, {
    client: new BlockchainClient(),
    blocks: [],
    transactions: [],
    wallet: new Wallet(),
  });

  function handleMessages(message: Message): void {
    switch (message.type) {
      case MessageTypes.NewBlockAnnouncement:
        dispatch({ type: "handle-block-announcement", message });
        break;
      case MessageTypes.TransactionAnnouncement:
        dispatch({ type: "handle-transaction-announcement", message });
        break;
      case MessageTypes.ChainRequest:
        dispatch({ type: "handle-chain-request" });
        break;
      case MessageTypes.ChainResponse:
        dispatch({ type: "handle-chain-response", message });
        break;
      default:
    }
  }

  useEffect(() => {
    (async () => {
      await state.client.connect(handleMessages);
      dispatch({ type: "send-chain-request" });
    })();
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

function useBlockchainClient() {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error(
      "useBlockchainClient must be used with a BlockchainProvider"
    );
  }

  return context;
}

export { BlockchainProvider, useBlockchainClient };
