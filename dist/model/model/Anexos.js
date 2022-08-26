"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
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
            console.log(ultimaVisita);
            const observaciones = ultimaVisita.map(visita => {
                return {
                    obs_creci: {
                        titulo: "Grow Status:",
                        valor: visita.obs_cre
                    },
                    obs_creci_t: {
                        titulo: "Grow Status:",
                        valor: visita.obs_cre
                    },
                    obs_fito: {
                        titulo: "Phitosanitary Status:",
                        valor: visita.obs_fito
                    },
                    obs_fito_t: {
                        titulo: "Phitosanitary Status:",
                        valor: visita.obs_fito
                    },
                    obs_generals: {
                        titulo: "General Status:",
                        valor: visita.obs_gen
                    },
                    obs_generals_t: {
                        titulo: "General Status:",
                        valor: visita.obs_gen
                    },
                    obs_globales: {
                        titulo: "GENERALS:",
                        valor: visita.obs
                    },
                    obs_globales_T: {
                        titulo: "GENERALS:",
                        valor: visita.obs
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
            respuestaAnexos.push({ anexo: anexo.num_anexo, obs: observaciones[0] });
        }
        return respuestaAnexos;
    }
}
exports.default = Anexo;
