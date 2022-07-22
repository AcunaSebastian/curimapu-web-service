"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
class Variedad {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getVariedades() {
        const especie = await this.dbConnection.select(`SELECT * FROM materiales ORDER BY nom_hibrido ASC`);
        return especie;
    }
    async getVariedadesCard(usuario, id_temporada) {
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = ` SELECT COUNT(DISTINCT(DQ.id_de_quo)) AS total
        FROM detalle_quotation DQ
        INNER JOIN quotation Q ON (DQ.id_quotation = Q.id_quotation)
        ${inner} 
        WHERE 1 ${filtro}`;
        const variedades = await this.dbConnection.select(sql);
        return { titulo: `Varieties`, total: variedades[0].total };
    }
}
exports.default = Variedad;
