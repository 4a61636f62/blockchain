import React from 'react';
import ReactDOM from 'react-dom';


import App from "./App";
import {BlockchainProvider} from "./BlockchainContext";

ReactDOM.render(
    <BlockchainProvider>
        <App />
    </BlockchainProvider>
    ,
    document.getElementById('root'));