import { DatabaseService } from '../database/DataBaseService';
import { IEspecie } from '../../interfaces/Especie';
import { IUsuario } from '../../interfaces/Usuarios';
import { ITemporada } from '../../interfaces/Temporada';
import { Constants } from '../../utils';

export default class Especie {
    

    constructor(private dbConnection:DatabaseService){}



    async getEspecieById(id_especie: number):Promise<IEspecie> {
    
        const especie:IEspecie[] = await this.dbConnection.select(`SELECT * FROM especie WHERE id_esp = '${id_especie}' LIMIT 1`);
        return especie[0];

    }


    async getEspecies():Promise<IEspecie[]>{
        const especie:IEspecie[] = await this.dbConnection.select(`SELECT * FROM especie ORDER BY nombre ASC`);
        return especie;
    }


    async getEspeciesCard( usuario:IUsuario, id_temporada?:number ) {


        let filtro = ``;
        let inner = ``;

        if(id_temporada){
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            filtro += ` AND U.id_usuario = '${ usuario.id_usuario }' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }

        const sql = ` SELECT COUNT(DISTINCT(id_esp)) AS total
        FROM quotation Q
        INNER JOIN detalle_quotation DQ ON (DQ.id_quotation = Q.id_quotation)
        ${inner} 
        WHERE 1 ${filtro }`;

        
        const especies = await this.dbConnection.select( sql );
        return { titulo:`Species`, total:especies[0].total};

    }


    async getEspeciesCliente(usuario:IUsuario, temporada?:ITemporada):Promise<IEspecie[]>{

        let filtro = ``;
        const enlazados = usuario.usuarios_enlazados;

        switch(usuario.id_tipo_usuario){

            case Constants.USUARIO_CLIENTE:
                if(enlazados.length <= 0) break;

                let tmp = ``;
                for (const enlaces of enlazados) {
                    if(tmp.length > 0) tmp += ` OR `;
                    tmp += ` especie.id_esp IN (SELECT DISTINCT id_esp FROM quotation WHERE id_cli = '${enlaces}') ` ;
                }

                filtro += ` AND ( ${tmp} ) `;

            break;
        }

        const sql = `SELECT especie.*, especie.id_esp AS value, especie.nombre AS label 
        FROM especie 
        WHERE 1 ${filtro} 
        ORDER BY especie.nombre ASC`;
        const especie:IEspecie[] = await this.dbConnection.select(sql);
        
        // const nuevoArreglo = especie.map( esp => {
        //     return {
        //         ...esp,
        //         label:`${esp.temporada}-${esp.nombre}`,
        //         nombre:`${esp.temporada}-${esp.nombre}`
        //     }
        // });
        
        return especie;
    }

}