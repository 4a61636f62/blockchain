export type UnminedBlock = {
  prevHash: string;
  timestamp: number;
  txs: Transaction[];
  minerAddress: string;
};

export type Block = UnminedBlock & {
  nonce: number;
  hash: string;
};

type TXID = string;

export type Transaction = {
  txid: TXID;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  timestamp: number;
};

export type TransactionInput = {
  txid: TXID;
  outputIndex: number;
  signature: {
    r: string;
    s: string;
  };
};

export type TransactionOutput = {
  amount: number;
  address: string;
};
