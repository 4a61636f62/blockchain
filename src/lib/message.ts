export type UUID = string;

export interface Message {
    correlationId: UUID;
    type: MessageTypes;
    payload?: any;
}

export enum MessageTypes {
    NewBlockAnnouncement    = 'NEW_BLOCK_ANNOUNCEMENT'
}