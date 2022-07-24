import { IResumen } from '../../interfaces';
import { DatabaseService } from '../database/';

export default class Foraneo {

    constructor( private dbConnection:DatabaseService){}


    getSqlForaneo (tabla:string, campo:string, id_ac:number) {

        let from = ``;
        let param = ``;
        let where = ``;
        let inner = ``;


        switch(tabla){

            case 'visita':
            default:
                from = tabla;
                param = campo;
                where = ` AND id_ac = '${id_ac}' `;
        }


        let sql = ` SELECT ${param} AS data ${inner} FROM ${from} WHERE 1 ${where} ORDER BY ${param} DESC`;
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