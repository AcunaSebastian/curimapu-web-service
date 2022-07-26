"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cliente {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getClienteById(id_cliente) {
        const sql = ` SELECT * FROM cliente WHERE id_cli = '${id_cliente}' LIMIT 1;`;
        const clientes = await this.dbConnection.select(sql);
        return clientes[0];
    }
}
exports.default = Cliente;
