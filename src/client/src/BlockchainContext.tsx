import React, {createContext, useContext, useEffect, useReducer} from 'react';
import {BlockchainClient} from "./blockchain-client";
import {Block} from "../../blockchain/block";
import {Message, MessageTypes} from "../../lib/message";

type State = {
    client: BlockchainClient
    blocks: Block[]
}
type Action =
    {type: 'add-block', block: Block} |
    {type: 'send-block-announcement', block: Block} |
    {type: 'send-chain-request'} |
    {type: 'handle-block-announcement', message: Message} |
    {type: 'handle-chain-request'} |
    {type: 'handle-chain-response', message: Message}

type Dispatch = (action: Action) => void
type ComponentProps = {children: React.ReactNode}

const BlockchainContext = createContext<{state: State; dispatch: Dispatch} | undefined>(undefined)

function reducer(state: State, action: Action) {
    switch (action.type) {
        case 'add-block':
            return {...state, blocks: state.client.addBlock(action.block, state.blocks)}
        case 'send-block-announcement':
            state.client.announceBlock(action.block)
            return state
        case 'send-chain-request':
            state.client.requestLongestChain()
            return state
        case 'handle-chain-request':
            state.client.sendChain(state.blocks)
            return state
        case 'handle-block-announcement':
            return {...state, blocks: state.client.handleBlockAnnouncement(action.message, state.blocks)}
        case 'handle-chain-response':
            return {...state, blocks: state.client.handleChainResponse(action.message)}
    }
    console.log(state)
    return state
}

function BlockchainProvider({children}: ComponentProps) {
    const [state, dispatch] = useReducer(reducer, {
        client: new BlockchainClient(),
        blocks: []
    })

    const handleMessages = (message: Message) => {
        switch (message.type) {
            case MessageTypes.NewBlockAnnouncement:
                return dispatch({type: 'handle-block-announcement', message})
            case MessageTypes.ChainRequest:
                return dispatch({type: 'handle-chain-request'})
            case MessageTypes.ChainResponse:
                return dispatch({type: 'handle-chain-response', message})
        }
    }

    useEffect(() => {
        (async () => {
            await state.client.connect(handleMessages)
            console.log("connected to blockchain server")
            dispatch({type: 'send-chain-request'})
        })()
    }, [])

    return <BlockchainContext.Provider value={ {state, dispatch} }>{children}</BlockchainContext.Provider>
}

function useBlockchainClient() {
    const context = useContext(BlockchainContext)
    if (!context) {
        throw new Error('useBlockchainClient must be used with a BlockchainClientProvider')
    }

    return context
}

export {BlockchainProvider, useBlockchainClient}



