import { DatabaseService } from '../database/DataBaseService';
import { IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Anexo {

    constructor(private dbConnection:DatabaseService){}

    // async getVariedades():Promise<IVariedad[]>{

    //     const especie:IVariedad[] = await this.dbConnection.select(`SELECT * FROM materiales ORDER BY nom_hibrido ASC`);
    //     return especie;

    // }


    async getAnexosCard( usuario:IUsuario, id_temporada?:number ){

        let filtro = ``;
        let inner = ``;

        if(id_temporada){
            filtro += ` AND F.id_tempo = '${id_temporada}' `;
        }

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            filtro += ` AND U.id_usuario = '${ usuario.id_usuario }' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }

        const sql = ` SELECT COUNT(DISTINCT(AC.id_ac)) AS total
        FROM anexo_contrato AC
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN detalle_quotation DQ USING(id_de_quo)
        ${inner} 
        WHERE 1 ${filtro }`;
        const anexos = await this.dbConnection.select( sql );
        return {titulo:`Lot Numbers`, total:anexos[0].total};

    }


}