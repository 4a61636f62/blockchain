import express from 'express';
import http from 'http';
import path from 'path';
import {BlockchainServer} from "./blockchain-server";

const PORT = 3000;
const app = express();
app.use('/',             express.static(path.join(__dirname, '../../public')));
app.use('/node_modules', express.static(path.join(__dirname, '../../node_modules')));

const httpServer: http.Server = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Listening on http://localhost:${PORT}`);
    }
});

new BlockchainServer(httpServer);
