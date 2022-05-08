export type UnminedBlock = {
  prevHash: string;
  timestamp: number;
  txs: Transaction[];
  minerAddress: string;
};

export type Block = UnminedBlock & {
  nonce: number;
  hash: string;
  difficulty: number;
};

export type Transaction = {
  txid: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  timestamp: number;
};

export type TransactionInput = {
  txid: string;
  outputIndex: number;
  signature: {
    r: string;
    s: string;
    recoveryParam: number | null;
  };
};

export type TransactionOutput = {
  amount: number;
  address: string;
  index: number;
};
