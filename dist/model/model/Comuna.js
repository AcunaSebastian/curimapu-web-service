"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Comuna {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async obtenerComuna() {
        const sql = `SELECT * FROM comuna`;
    }
}
exports.default = Comuna;
