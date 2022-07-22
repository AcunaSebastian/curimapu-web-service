import { DatabaseService } from '../database/DataBaseService';
import { IVariedad,IUsuario, ITemporada } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Temporada {

    constructor(private dbConnection:DatabaseService){}

    async getTemporadas( usuario:IUsuario):Promise<ITemporada[]>{


        let filtro = ``;

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){
            filtro += ` AND id_tempo IN ( SELECT DISTINCT id_tempo FROM quotation WHERE id_cli = '${usuario.id_usuario}' )`;
        }

        const temporadas:ITemporada[] = await this.dbConnection.select(`SELECT * FROM temporada WHERE 1 ${filtro}   ORDER BY nombre ASC`);
        return temporadas;

    }


}