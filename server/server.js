"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
let socketIO = require('socket.io');
const bearerToken = require('express-bearer-token');
//import {router as productRouter} from './product'
const user_1 = require("./user");
const session_1 = require("./session");
const product_1 = require("./product");
const generals_1 = require("./generals");
const file_server = express.static(__dirname + '/Public');
const app = express()
    .use('/files', file_server)
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
    extended: true
}))
    .use(bearerToken())
    .use(session_1.router)
    .use(user_1.router)
    .use(product_1.router)
    .use(generals_1.router);
/////////////////////////////////SOCKET FOR CHAT APP///////////////////////////////////////
const port = 4201;
const server = app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('My Node App listening on port 4201');
    var host = server.address();
    console.log('Example app listening at http://%s:%s', host, port);
    console.log(host);
});
let io = socketIO(server);
io.on('connection', (socket) => {
    //console.log('user connected');
    socket.on('new-message', (message) => __awaiter(this, void 0, void 0, function* () {
        console.log(message);
    }));
    socket.on('renato', (message) => {
        console.log('sent back: ', message);
        io.emit('renato', message);
    });
    socket.on('user', (message) => __awaiter(this, void 0, void 0, function* () {
        console.log('user logged in:');
        console.log(message);
    }));
    socket.on('disconnect', function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`User: disconnected.`); // retrieve it from socket object
        });
    });
});
