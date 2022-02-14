"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const blockchain_server_1 = require("./blockchain-server");
const PORT = 3000;
const app = (0, express_1.default)();
app.use('/', express_1.default.static(path_1.default.join(__dirname, '../client/public')));
app.use('/node_modules', express_1.default.static(path_1.default.join(__dirname, '../../node_modules')));
const httpServer = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Listening on http://localhost:${PORT}`);
    }
});
new blockchain_server_1.BlockchainServer(httpServer);
//# sourceMappingURL=main.js.map