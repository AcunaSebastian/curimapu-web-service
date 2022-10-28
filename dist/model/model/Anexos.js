"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
class Anexo {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }
    // async getVariedades():Promise<IVariedad[]>{
    //     const especie:IVariedad[] = await this.dbConnection.select(`SELECT * FROM materiales ORDER BY nom_hibrido ASC`);
    //     return especie;
    // }
    async getAnexosCard(usuario, id_temporada) {
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
        const sql = ` SELECT COUNT(DISTINCT(AC.id_ac)) AS total
        FROM anexo_contrato AC
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN detalle_quotation DQ USING(id_de_quo)
        ${inner} 
        WHERE 1 ${filtro}`;
        const anexos = await this.dbConnection.select(sql);
        return { titulo: `Lot Numbers`, total: anexos[0].total };
    }
    async getAnexosByIdCli(id_cliente, id_temporada, id_especie) {
        let filtro = ` `;
        if (id_especie) {
            filtro += ` AND quotation.id_esp = '${id_especie}' `;
        }
        const sql = ` SELECT num_anexo, id_ac FROM anexo_contrato 
        INNER JOIN detalle_quotation USING (id_de_quo) 
        INNER JOIN quotation USING(id_quotation)
        WHERE quotation.id_cli = '${id_cliente}' 
        AND quotation.id_tempo = '${id_temporada}' 
        ${filtro} `;
        const anexos = await this.dbConnection.select(sql);
        return anexos;
    }
    async getTranslatedObs(obs) {
        console.log("size", new buffer_1.Blob([obs]).size);
        console.log({ obs });
        let translation;
        try {
            let { data } = await axios_1.default.get(`https://api.mymemory.translated.net/get?q=${obs}&langpair=es|en&de=zcloudticket@gmail.com`);
            let { responseData } = data;
            console.log({ data });
            translation = responseData.translatedText;
        }
        catch (error) {
            console.log({ error });
        }
        return translation;
    }
    sanitizarTexto(observacion) {
        return observacion
            .replaceAll('Á', 'A')
            .replaceAll('É', 'E')
            .replaceAll('Í', 'I')
            .replaceAll('Ó', 'O')
            .replaceAll('Ú', 'U')
            .replaceAll('á', 'a')
            .replaceAll('é', 'e')
            .replaceAll('í', 'i')
            .replaceAll('ó', 'o')
            .replaceAll('ú', 'u')
            .replaceAll('\n', ' ')
            .replaceAll('.', '')
            .replaceAll('Ñ', 'N');
    }
    async getObservacionesByAnexo(anexos) {
        if (anexos.length <= 0)
            return [];
        const respuestaAnexos = [];
        for (const anexo of anexos) {
            const sql = `SELECT * FROM visita 
            WHERE id_ac = '${anexo.id_ac}' AND cron_envia_corr != 'CREADA DESDE WEB' 
            ORDER BY id_visita DESC LIMIT 1`;
            const ultimaVisita = await this.dbConnection.select(sql);
            if (ultimaVisita.length <= 0)
                continue;
            const observaciones = ultimaVisita.map(async (visita) => {
                visita.obs_cre_t = (visita.obs_cre.trim().length > 0) ? visita.obs_cre.trim() : "";
                visita.obs_fito_t = (visita.obs_fito.trim().length > 0) ? visita.obs_fito.trim() : "";
                visita.obs_gen_t = (visita.obs_gen.trim().length > 0) ? visita.obs_gen.trim() : "";
                visita.obs_t = (visita.obs.trim().length > 0) ? visita.obs.trim() : "";
                visita.obs_hum_t = (visita.obs_hum.trim().length > 0) ? visita.obs_hum.trim() : "";
                visita.obs_male_t = (visita.obs_male.trim().length > 0) ? visita.obs_male.trim() : "";
                return {
                    obs_creci: {
                        titulo: "Grow Status:",
                        valor: visita.obs_cre
                    },
                    obs_creci_t: {
                        titulo: "Grow Status:",
                        valor: visita.obs_cre_t
                    },
                    obs_fito: {
                        titulo: "Phitosanitary Status:",
                        valor: visita.obs_fito
                    },
                    obs_fito_t: {
                        titulo: "Phitosanitary Status:",
                        valor: visita.obs_fito_t
                    },
                    obs_generals: {
                        titulo: "General Status:",
                        valor: visita.obs_gen
                    },
                    obs_generals_t: {
                        titulo: "General Status:",
                        valor: visita.obs_gen_t
                    },
                    obs_globales: {
                        titulo: "GENERALS:",
                        valor: visita.obs
                    },
                    obs_globales_T: {
                        titulo: "GENERALS:",
                        valor: visita.obs_t
                    },
                    obs_hum: {
                        titulo: "Soil Moisture Status:",
                        valor: visita.obs_hum
                    },
                    obs_hum_t: {
                        titulo: "Soil Moisture Status:",
                        valor: visita.obs_hum_t
                    },
                    obs_male: {
                        titulo: "Weed Pressure Status:",
                        valor: visita.obs_male
                    },
                    obs_male_t: {
                        titulo: "Weed Pressure Status:",
                        valor: visita.obs_male_t
                    },
                };
            });
            respuestaAnexos.push({ anexo: anexo.num_anexo, obs: await observaciones[0] });
        }
        return respuestaAnexos;
    }
}
exports.default = Anexo;
