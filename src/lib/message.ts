export type UUID = string;

export interface Message {
    correlationId: UUID;
    type: MessageTypes;
    payload?: string;
}

export enum MessageTypes {
    NewBlockAnnouncement = 'NEW_BLOCK_ANNOUNCEMENT',
    TransactionAnnouncement = 'TRANSACTION_ANNOUNCEMENT',
    ChainRequest = 'CHAIN_REQUEST',
    ChainResponse = 'CHAIN_RESPONSE'
}
