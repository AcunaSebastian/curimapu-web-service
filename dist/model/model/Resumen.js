"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Foraneo_1 = __importDefault(require("./Foraneo"));
class Resumen {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getCabecera(id_temporada, id_especie) {
        const sql = `SELECT 
        PCM.id_prop_mat_cli,
        PCM.id_esp,
        PCM.id_prop,
        PCM.id_etapa,
        PCM.id_tempo,
        PCM.id_sub_propiedad,
        PCM.orden,
        PCM.identificador,
        PCM.foraneo,
        PCM.tabla,
        PCM.campo,
        P.nombre_en AS nombre_propiedad, SP.nombre_en AS nombre_sub_propiedad 
        FROM prop_cli_mat PCM
        LEFT JOIN propiedades P USING (id_prop) 
        INNER JOIN sub_propiedades SP USING (id_sub_propiedad)
        WHERE muestra_en_resumen > 0 AND aplica = 'SI'
        AND id_tempo = '${id_temporada}' AND id_esp = '${id_especie}'
        ORDER BY muestra_en_resumen ASC;`;
        const cabecera = await this.dbConnection.select(sql);
        return cabecera;
    }
    async getData(id_temporada, id_especie, usuario, page, limit) {
        const cabeceras = await this.getCabecera(id_temporada, id_especie);
        let filtro = ``;
        if (usuario.usuarios_enlazados.length > 0) {
            let tmp = ``;
            for (const enlaces of usuario.usuarios_enlazados) {
                if (tmp.length > 0)
                    tmp += ` OR `;
                tmp += ` Q.id_cli = '${enlaces}' `;
            }
            if (tmp.length > 0) {
                filtro += ` AND ( ${tmp} ) `;
            }
        }
        if (usuario.isUsuarioDetQuo) {
            filtro += ` AND DQ.id_de_quo IN (SELECT id_de_quo FROM usuario_det_quo WHERE id_usuario = '${usuario.id_usuario}') `;
        }
        let limite = ``;
        if (limit) {
            limite = ` LIMIT ${page}, ${limit} `;
        }
        const sql = `SELECT 
        AC.num_anexo,
        AC.id_ac,
        Q.id_cli,
        Q.id_esp,
        Q.id_tempo,
        Q.numero_contrato
      FROM
        detalle_quotation DQ
        INNER JOIN quotation Q ON (DQ.id_quotation = Q.id_quotation)
        INNER JOIN anexo_contrato AC ON (DQ.id_de_quo = AC.id_de_quo) 
        WHERE  Q.id_esp='${id_especie}' AND Q.id_tempo='${id_temporada}' ${filtro}  ${limite} `;
        const anexos = await this.dbConnection.select(sql);
        if (anexos.length <= 0)
            return anexos;
        const respuestaAnexos = [];
        for (const anexo of anexos) {
            const sql = `SELECT 
                DVP.id_prop_mat_cli,
                DVP.valor,
                DVP.id_det_vis_prop
                FROM
                    prop_cli_mat PCM
                    LEFT JOIN detalle_visita_prop DVP ON (PCM.id_prop_mat_cli = DVP.id_prop_mat_cli)
                    INNER JOIN visita V ON (DVP.id_visita = V.id_visita)
                WHERE 
                    V.id_ac='${anexo.id_ac}' AND  muestra_en_resumen > '0' AND PCM.aplica = 'SI'   
                ORDER BY muestra_en_resumen ASC
                    `;
            const datosVisita = await this.dbConnection.select(sql);
            const tpmData = [];
            for (const cabecera of cabeceras) {
                if (cabecera.foraneo === 'NO') {
                    const elementos = datosVisita.filter(dato => dato.id_prop_mat_cli === cabecera.id_prop_mat_cli);
                    elementos.sort((el, al) => al.id_det_vis_prop - el.id_det_vis_prop);
                    if (elementos.length > 0)
                        tpmData.push({ ...elementos[0], sp: cabecera.nombre_sub_propiedad });
                    else
                        tpmData.push({ id_prop_mat_cli: cabecera.id_prop_mat_cli, id_det_vis_prop: null, valor: null, sp: cabecera.nombre_sub_propiedad });
                }
                if (cabecera.foraneo === 'SI') {
                    const foraneo = new Foraneo_1.default(this.dbConnection);
                    const datoForaneo = await foraneo.getForaneo(cabecera, anexo.id_ac);
                    tpmData.push({
                        id_prop_mat_cli: cabecera.id_prop_mat_cli,
                        id_det_vis_prop: null,
                        valor: datoForaneo.data,
                        sp: cabecera.nombre_sub_propiedad
                    });
                }
            }
            respuestaAnexos.push({
                ...anexo,
                data: tpmData
            });
        }
        return respuestaAnexos;
    }
}
exports.default = Resumen;
