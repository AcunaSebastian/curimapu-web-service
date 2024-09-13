import { DatabaseService } from "../database/DataBaseService";
import { IUsuario } from "../../interfaces/";
import { Constants } from "../../utils";
import parseUrl from "parse-url";

import axios from "axios";
import { Blob } from "buffer";
import { Traductor } from "./Traductor";

export default class Anexo {
  constructor(private dbConnection: DatabaseService) {}

  // async getVariedades():Promise<IVariedad[]>{

  //     const especie:IVariedad[] = await this.dbConnection.select(`SELECT * FROM materiales ORDER BY nom_hibrido ASC`);
  //     return especie;

  // }

  async getAnexosCard(usuario: IUsuario, id_temporada?: number) {
    let filtro = ``;
    let inner = ``;

    if (id_temporada) {
      filtro += ` AND F.id_tempo = '${id_temporada}' `;
    }

    if (usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE) {
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

  async getAnexosByIdCli(id_cliente: number, id_temporada: number, id_especie?: number) {
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

  sanitizarTexto(observacion: string): string {
    return observacion
      .replaceAll("Á", "A")
      .replaceAll("É", "E")
      .replaceAll("Í", "I")
      .replaceAll("Ó", "O")
      .replaceAll("Ú", "U")
      .replaceAll("á", "a")
      .replaceAll("é", "e")
      .replaceAll("í", "i")
      .replaceAll("ó", "o")
      .replaceAll("ú", "u")
      .replaceAll("\n", " ")
      .replaceAll(".", "")
      .replaceAll("Ñ", "N");
  }

  async getObservacionesByAnexo(anexos: any[], usuarios: IUsuario, sistema: string) {
    if (anexos.length <= 0) return [];

    const traductor = new Traductor();
    const observaciones: any[] = [];
    for (const anexo of anexos) {
      const sql = `SELECT * FROM visita 
            WHERE id_ac = '${anexo.id_ac}' AND cron_envia_corr != 'CREADA DESDE WEB' 
            ORDER BY id_visita DESC LIMIT 1`;

      const ultimaVisita = await this.dbConnection.select(sql);

      if (ultimaVisita.length <= 0) continue;

      for (const visita of ultimaVisita) {
        if (visita.obs_cre_t.length == 0 && visita.obs_cre.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs_cre,
          });
          visita.obs_cre_t = trans;
        }
        if (visita.obs_fito_t.length == 0 && visita.obs_fito.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs_fito,
          });
          visita.obs_fito_t = trans;
        }
        if (visita.obs_gen_t.length == 0 && visita.obs_gen.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs_gen,
          });
          visita.obs_gen_t = trans;
        }
        if (visita.obs_t.length == 0 && visita.obs.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs,
          });
          visita.obs_t = trans;
        }
        if (visita.obs_hum_t.length == 0 && visita.obs_hum.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs_hum,
          });
          visita.obs_hum_t = trans;
        }
        if (visita.obs_male_t.length == 0 && visita.obs_male.length > 0) {
          const trans = await traductor.traducir({
            id_registro: visita.id_visita,
            rut: usuarios.rut,
            sistema: sistema,
            texto: visita.obs_male,
          });
          visita.obs_male_t = trans;
        }

        if (visita.obs_t.length > 0) {
          observaciones.push({ id_visita: visita.id_visita, name: `obs_t`, value: visita.obs_t });
        }
        if (visita.obs_cre_t.length > 0) {
          observaciones.push({
            id_visita: visita.id_visita,
            name: `obs_cre_t`,
            value: visita.obs_cre_t,
          });
        }
        if (visita.obs_fito_t.length > 0) {
          observaciones.push({
            id_visita: visita.id_visita,
            name: `obs_fito_t`,
            value: visita.obs_fito_t,
          });
        }

        if (visita.obs_gen_t.length > 0) {
          observaciones.push({
            id_visita: visita.id_visita,
            name: `obs_gen_t`,
            value: visita.obs_gen_t,
          });
        }
        if (visita.obs_hum_t.length > 0) {
          observaciones.push({
            id_visita: visita.id_visita,
            name: `obs_hum_t`,
            value: visita.obs_hum_t,
          });
        }
        if (visita.obs_male_t.length > 0) {
          observaciones.push({
            id_visita: visita.id_visita,
            name: `obs_male_t`,
            value: visita.obs_male_t,
          });
        }
      }
    }
    return observaciones;
  }
}
