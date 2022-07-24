"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const axios_1 = __importDefault(require("axios"));
class Visita {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getVisitas(filters) {
        const { usuario, id_temporada, id_especie, id_variedad, fecha_visita, agricultor, ready_batch, lote, num_anexo } = filters;
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }
        if (num_anexo) {
            filtro += ` AND num_anexo LIKE '%${num_anexo}%' `;
        }
        if (id_especie) {
            filtro += ` AND Q.id_esp = '${id_especie}' `;
        }
        if (id_variedad) {
            filtro += ` AND DQ.id_materiales = '${id_variedad}' `;
        }
        if (agricultor) {
            filtro += ` AND A.razon_social LIKE '%${agricultor}%' `;
        }
        if (fecha_visita) {
            filtro += ` AND V.fecha_r = '${fecha_visita}' `;
        }
        if (ready_batch) {
            filtro += ` AND AC.ready_batch LIKE '%${ready_batch}%'`;
        }
        if (lote) {
            filtro += ` AND L.nombre LIKE '%${lote}%' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            let tmp = ` Q.id_cli = '${usuario.id_usuario}' `;
            for (const enlace of usuario.usuarios_enlazados) {
                tmp += ` OR Q.id_cli = '${enlace}' `;
            }
            filtro += ` AND ( ${tmp} ) `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = `SELECT 
        V.id_visita,
        L.nombre AS lote,
        AC.num_anexo,
        A.razon_social AS nombre_agricultor,
        AC.ready_batch,
        E.nombre AS desc_especie,
        Q.id_esp AS id_especie,
        M.nom_hibrido AS desc_variedad,
        DQ.id_materiales AS id_variedad,
        V.fecha_r AS fecha_visita
        FROM visita V
        INNER JOIN anexo_contrato AC USING (id_ac) 
        INNER JOIN detalle_quotation DQ USING (id_de_quo)
        INNER JOIN quotation Q USING (id_quotation)
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN agricultor A USING (id_agric)
        INNER JOIN lote L ON (F.id_lote = L.id_lote)
        INNER JOIN materiales M ON ( DQ.id_materiales = M.id_materiales )
        INNER JOIN especie E ON (Q.id_esp = E.id_esp)

        ${inner} WHERE 1 ${filtro} ORDER BY V.fecha_r DESC `;
        const visitas = await this.dbConnection.select(sql);
        return visitas;
    }
    async getVisitasCard(usuario, id_temporada) {
        let filtro = ``;
        let inner = ``;
        if (id_temporada) {
            filtro += ` AND F.id_tempo = '${id_temporada}' `;
        }
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            filtro += ` AND U.id_usuario = '${usuario.id_usuario}' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }
        const sql = ` SELECT  COUNT(DISTINCT(V.id_visita)) AS total 
        FROM visita V 
        INNER JOIN anexo_contrato AC USING(id_ac)
        INNER JOIN ficha F USING(id_ficha)
        INNER JOIN detalle_quotation DQ ON (DQ.id_de_quo = AC.id_de_quo)
        ${inner} 
        WHERE 1 ${filtro}`;
        const visitas = await this.dbConnection.select(sql);
        return { titulo: `Visits`, total: visitas[0].total };
    }
    async getPDF(id_visita) {
        try {
            const { data } = await axios_1.default.get(`http://www.zcloud.cl/c.curimapu/info_visita.php?visita=${id_visita}`, {
                responseType: 'blob'
            });
            return data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.log(error.message);
            }
            return [];
        }
        // console.log(data)
    }
}
exports.default = Visita;