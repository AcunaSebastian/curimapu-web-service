import { IResumen } from '../../interfaces';
import { DatabaseService } from '../database/';

export default class Foraneo {

    constructor( private dbConnection:DatabaseService){}


    getSqlForaneo (tabla:string, campo:string, id_ac:number) {


        let sql = `SELECT ${campo} AS data FROM ${tabla} `;

        if(tabla === 'usuarios' && campo === 'nombre'){
            sql = `SELECT CONCAT(nombre,' ',apellido_p,' ',apellido_m) AS data FROM ${tabla} `;
        }

        if(tabla === 'fieldman_asis' && campo === 'nombre'){
            sql = ` SELECT CONCAT(nombre,' ',apellido_p,' ',apellido_m) AS data FROM usuarios`;
        }

        if(tabla === 'historial_predio' && campo === 'nombre'){
            sql = ` SELECT group_concat(CONCAT(anno,':',descripcion) SEPARATOR '||') AS Dato FROM ${tabla} `;
        }

        switch(tabla){

            case 'agricultor':

                sql += ` INNER JOIN ficha USING(id_agric)
                INNER JOIN anexo_contrato AC USING (id_ficha) 
                WHERE AC.id_ac = '${id_ac}'`;

                break;
            case 'lote':
                sql += ` INNER JOIN anexo_contrato USING (id_lote) WHERE AC.id_ac = '${id_ac}' `;
                break;
            case 'predio':
                sql += ` INNER JOIN lote USING (id_pred)
                INNER JOIN anexo_contrato USING (id_lote)
                WHERE AC.id_ac = '${id_ac}'
                `;
                break;

            case 'comuna':
                sql += `INNER JOIN ficha USING (id_comuna) 
                INNER JOIN anexo_contrato USING (id_ficha)
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;

            case 'cliente':
                sql += ` INNER JOIN quotation USING(id_cli) 
                INNER JOIN detalle_quotation USING (id_quotation)
                INNER JOIN anexo_contrato USING (id_de_quo)
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                console.log(sql)
                break;

            case 'especie':
                sql += ` INNER JOIN quotation USING(id_esp) 
                INNER JOIN detalle_quotation USING (id_quotation)
                INNER JOIN anexo_contrato USING (id_de_quo)
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;

            case 'materiales':
                sql += `
                INNER JOIN anexo_contrato USING (id_materiales)
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;
            case 'tipo_riego':
                sql += `
                INNER JOIN ficha USING (id_tipo_riego) 
                INNER JOIN anexo_contrato USING (id_ficha) 
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;
            case 'tipo_suelo':
                sql += `
                INNER JOIN ficha USING (id_tipo_suelo) 
                INNER JOIN anexo_contrato USING (id_ficha) 
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;
            case 'ficha':
                sql += `
                INNER JOIN anexo_contrato USING (id_ficha) 
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;
            case 'usuarios':
                sql += `
                INNER JOIN ficha USING (id_usuario) 
                INNER JOIN anexo_contrato USING (id_ficha) 
                WHERE anexo_contrato.id_ac = '${id_ac}' `;
                break;
            case 'historial_predio':
                sql += `
                INNER JOIN ficha USING (id_usuario) 
                INNER JOIN anexo_contrato USING (id_ficha) 
                WHERE anexo_contrato.id_ac = '${id_ac}' AND historial_predio.tipo = 'F' GROUP BY id_ficha `;
                break;
            case 'visita':
                sql += `
                WHERE id_ac = '${id_ac}' AND ${tabla}.${campo} IS NOT NULL ORDER BY id_visita DESC LIMIT 1`;
                break;
            default:
                sql+= ` WHERE id_ac = '${id_ac}' `;
                break;
        }

         return sql;

    }


    async getForaneo(cabecera:IResumen, id_ac:number ){

        if(cabecera.foraneo === 'NO') return [];

        try {
            const sql = this.getSqlForaneo(cabecera.tabla, cabecera.campo, id_ac);
            const dato = await this.dbConnection.select(sql);
            return dato[0];
        } catch (error) {
            return { data:null }
        }

    }
}