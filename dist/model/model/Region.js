"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Region {
    constructor(DbConnection) {
        this.DbConnection = DbConnection;
    }
    async obtenerRegion() {
        const sql = `SELECT * FROM region WHERE id_region_api IS NOT NULL`;
        const regiones = await this.DbConnection.select(sql);
        return regiones;
    }
}
exports.default = Region;
