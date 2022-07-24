"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Foraneo {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    getSqlForaneo(tabla, campo, id_ac) {
        let from = ``;
        let param = ``;
        let where = ``;
        let inner = ``;
        switch (tabla) {
            case 'visita':
            default:
                from = tabla;
                param = campo;
                where = ` AND id_ac = '${id_ac}' `;
        }
        let sql = ` SELECT ${param} AS data ${inner} FROM ${from} WHERE 1 ${where} ORDER BY ${param} DESC`;
        return sql;
    }
    async getForaneo(cabecera, id_ac) {
        if (cabecera.foraneo === 'NO')
            return [];
        try {
            const sql = this.getSqlForaneo(cabecera.tabla, cabecera.campo, id_ac);
            const dato = await this.dbConnection.select(sql);
            return dato[0];
        }
        catch (error) {
            return { data: null };
        }
    }
}
exports.default = Foraneo;
