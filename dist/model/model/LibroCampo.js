"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const _1 = require("./");
const axios_1 = __importDefault(require("axios"));
class LibroCampo {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    async getCabecera(params) {
        const { id_temporada, id_especie, usuario, etapa } = params;
        let filtro = '';
        let inner = '';
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            if (usuario.usuarios_enlazados.length > 0) {
                inner += ` INNER JOIN cli_pcm CPCM USING (id_prop_mat_cli) `;
                let tmp = ` CPCM.id_cli = '${usuario.id_usuario}' AND CPCM.ver = '1' `;
                for (const enlaces of usuario.usuarios_enlazados) {
                    tmp += ` OR CPCM.id_cli = '${enlaces}' AND CPCM.ver = '1' `;
                }
                filtro += ` AND ( ${tmp} ) `;
            }
        }
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
        ${inner}
        LEFT JOIN propiedades P USING (id_prop) 
        INNER JOIN sub_propiedades SP USING (id_sub_propiedad)
        WHERE aplica = 'SI' AND id_tempo = '${id_temporada}' AND id_esp = '${id_especie}'
        ${filtro}
        ORDER BY PCM.orden ASC;`;
        const cabecera = await this.dbConnection.select(sql);
        return cabecera;
    }
    async getData(params) {
        const { id_temporada, id_especie, usuario, limit, page = 0, num_anexo, ready_batch, recomendaciones, agricultor, predio, lote } = params;
        const cabeceras = await this.getCabecera(params);
        let filtroPCM = ``;
        let innerPCM = ``;
        let filtro = ``;
        if (usuario.id_tipo_usuario === utils_1.Constants.USUARIO_CLIENTE) {
            innerPCM += ` INNER JOIN cli_pcm CPCM USING (id_prop_mat_cli) `;
            let tmp = ` CPCM.id_cli = '${usuario.id_usuario}' AND CPCM.ver = '1' `;
            for (const enlaces of usuario.usuarios_enlazados) {
                tmp += ` OR CPCM.id_cli = '${enlaces}' AND CPCM.ver = '1' `;
            }
            filtroPCM += ` AND ( ${tmp} ) `;
        }
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
        if (num_anexo) {
            filtro += ` AND AC.num_anexo LIKE %${num_anexo}%`;
        }
        if (ready_batch) {
            filtro += ` AND AC.ready_batch LIKE %${ready_batch}%`;
        }
        if (recomendaciones) {
            filtro += ` AND AC.id_ac IN (SELECT id_ac FROM visita WHERE recome LIKE '%${recomendaciones}%' ) `;
        }
        if (agricultor) {
            filtro += ` AND A.razon_social LIKE '%${agricultor}%' `;
        }
        if (predio) {
            filtro += ` AND P.nombre LIKE '%${predio}%' `;
        }
        if (lote) {
            filtro += ` AND L.nombre LIKE '%${lote}%' `;
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
        Q.numero_contrato,
        A.razon_social AS nombre_agricultor,
        L.nombre AS lote,
        P.nombre AS predio,
        AC.ready_batch,
        AC.has_gps,
        (SELECT recome FROM visita WHERE id_ac = AC.id_ac ORDER BY id_visita DESC LIMIT 1 ) AS recomendaciones
      FROM
        detalle_quotation DQ
        INNER JOIN quotation Q ON (DQ.id_quotation = Q.id_quotation)
        INNER JOIN anexo_contrato AC ON (DQ.id_de_quo = AC.id_de_quo) 
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN agricultor A USING (id_agric)
        INNER JOIN lote L ON (F.id_lote = L.id_lote)
        INNER JOIN predio P ON (F.id_pred = P.id_pred)
        WHERE  Q.id_esp='${id_especie}' AND Q.id_tempo='${id_temporada}' ${filtro} ${limite} `;
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
                ${innerPCM}
                LEFT JOIN detalle_visita_prop DVP ON (PCM.id_prop_mat_cli = DVP.id_prop_mat_cli)
                INNER JOIN visita V ON (DVP.id_visita = V.id_visita)
                WHERE V.id_ac='${anexo.id_ac}' AND PCM.aplica = 'SI' ${filtroPCM}
                ORDER BY PCM.orden ASC `;
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
                    const foraneo = new _1.Foraneo(this.dbConnection);
                    const datoForaneo = await foraneo.getForaneo(cabecera, anexo.id_ac);
                    tpmData.push({
                        id_prop_mat_cli: cabecera.id_prop_mat_cli,
                        id_det_vis_prop: null,
                        valor: datoForaneo?.data || '',
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
    async getImagenes(id_anexo, systemParams) {
        const sql = `SELECT fotos.* FROM fotos 
        INNER JOIN visita USING (id_visita)
        WHERE tipo = 'V' AND visita.id_ac = '${id_anexo}' `;
        const fotosVisitas = await this.dbConnection.select(sql);
        const nuevasFotosVisitas = fotosVisitas.map(foto => {
            const nuevaUrl = `http://${systemParams.ip_host}/` + foto.ruta_foto
                .replaceAll('../', '')
                .replaceAll(`${systemParams.document_folder}/img_android`, `${systemParams.compressed_image_folder}`);
            return {
                ...foto,
                ruta_muestra_foto: nuevaUrl
            };
        });
        return nuevasFotosVisitas;
    }
    async getOneImage(path, systemParams) {
        const newPath = path.replaceAll(`${systemParams.document_folder}/img_android`, `${systemParams.compressed_image_folder}`);
        const url = `http://${systemParams.ip_host}/${systemParams.proyect_main_folder}/core/models/mostrarImagen.php?ruta_imagen=${newPath}`;
        console.log(url);
        console.log(newPath);
        const { data } = await axios_1.default.get(url, {
        // responseType:'stream'
        });
        return data;
    }
}
exports.default = LibroCampo;
