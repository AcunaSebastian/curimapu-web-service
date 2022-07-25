"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
class Temporada {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getTemporadaById(id_temporada) {
        const temporadas = await this.dbConnection.select(` SELECT temporada.*, temporada.id_tempo AS value, temporada.nombre AS label FROM temporada WHERE id_tempo = '${id_temporada}' `);
        return temporadas[0];
    }
    async getTemporadas(usuario) {
        let filtro = ``;
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND id_tempo IN ( SELECT DISTINCT id_tempo FROM quotation WHERE id_cli = '${usuario.id_usuario}' )`;
        }
        const temporadas = await this.dbConnection.select(`SELECT * FROM temporada WHERE 1 ${filtro}   ORDER BY nombre ASC`);
        return temporadas;
    }
}
exports.default = Temporada;
