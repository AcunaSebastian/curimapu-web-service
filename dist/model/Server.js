"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const router_1 = require("../router/");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = Number(process.env.PORT) | 3000;
        this.middlewares();
        this.routes();
    }
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
        this.app.use((0, express_fileupload_1.default)({ useTempFiles: true, tempFileDir: '/tmp/' }));
    }
    routes() {
        this.app.use('/api/auth', router_1.authRouter);
        this.app.use('/api/filters', router_1.filterRouter);
        this.app.use('/api/home', router_1.homeRouter);
        this.app.use('/api/resumen', router_1.resumenRouter);
        this.app.use('/api/visitas', router_1.visitasRouter);
        // this.app.use('/api/dte', dteRouter);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port : ${this.port}`);
        });
    }
}
exports.default = Server;
