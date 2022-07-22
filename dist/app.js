"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const model_1 = require("./model");
const server = new model_1.Server();
server.listen();
