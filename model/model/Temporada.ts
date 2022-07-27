import { DatabaseService } from '../database/DataBaseService';
import { IVariedad,IUsuario, ITemporada } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Temporada {
    

    constructor(private dbConnection:DatabaseService){}

    async getTemporadaById(id_temporada: number):Promise<ITemporada> {
        
        const temporadas = await this.dbConnection.select(` SELECT temporada.*, temporada.id_tempo AS value, temporada.nombre AS label FROM temporada WHERE id_tempo = '${id_temporada}' `);
        return temporadas[0];
    }


    async getTemporadas( usuario:IUsuario):Promise<ITemporada[]>{


        let filtro = ``;

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            filtro += ` AND id_tempo IN ( SELECT DISTINCT id_tempo FROM quotation WHERE ${usuario.usuarios_enlazados.map( enlace => ` id_cli = '${enlace}' `).join(` OR `)}  )`;
        }

        const temporadas:ITemporada[] = await this.dbConnection.select(`SELECT temporada.* , temporada.id_tempo AS value, temporada.nombre AS label FROM temporada WHERE 1 ${filtro}   ORDER BY nombre ASC`);
        return temporadas;

    }


}