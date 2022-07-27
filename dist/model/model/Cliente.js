"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
class Cliente {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getClienteById(id_cliente) {
        const sql = ` SELECT * FROM cliente WHERE id_cli = '${id_cliente}' LIMIT 1;`;
        const clientes = await this.dbConnection.select(sql);
        return clientes[0];
    }
    async getClienteByEnlace(usuario) {
        let filtro = ``;
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            if (usuario.usuarios_enlazados.length > 0) {
                filtro = ` AND ( ${usuario.usuarios_enlazados.map(enlace => ` id_cli = '${enlace}' `).join(` OR `)} ) `;
            }
        }
        const sql = `SELECT cliente.*, cliente.id_cli AS value, cliente.razon_social AS label 
        FROM cliente  
        WHERE 1 ${filtro}
        ORDER BY razon_social ASC`;
        const clientes = await this.dbConnection.select(sql);
        return clientes;
    }
}
exports.default = Cliente;
