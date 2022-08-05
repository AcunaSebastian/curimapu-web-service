"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
class Variedad {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getVariedades(usuario) {
        let filtro = ``;
        let inner = ``;
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = `SELECT 
            materiales.*, 
            materiales.id_materiales AS value, 
            materiales.nom_hibrido AS label,
            temporada.nombre AS temporada,
            quotation.id_tempo
        FROM detalle_quotation DQ
        INNER JOIN quotation USING (id_quotation)
        INNER JOIN temporada USING (id_tempo)
        INNER JOIN materiales USING(id_materiales) 
        ${inner}
        WHERE 1 ${filtro}
        GROUP BY materiales.id_materiales, quotation.id_tempo
        ORDER BY nom_hibrido ASC`;
        console.log(sql);
        const variedades = await this.dbConnection.select(sql);
        const nuevoArrego = variedades.map(variedad => {
            const existenMas = variedades.filter(vari => vari.nom_hibrido === variedad.nom_hibrido);
            const nuevoNombre = `${variedad.temporada}-${variedad.nom_hibrido}`;
            if (existenMas.length <= 1)
                return { ...variedad, nom_hibrido: nuevoNombre, label: nuevoNombre };
            return {
                ...variedad,
                label: `${nuevoNombre}-${variedad.id_materiales_SAP}`,
                nom_hibrido: `${nuevoNombre}-${variedad.id_materiales_SAP}`
            };
        });
        return nuevoArrego;
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
