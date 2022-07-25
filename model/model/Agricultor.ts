import { DatabaseService } from '../database/DataBaseService';
import { IVariedad, IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Agricultor {

    constructor(private dbConnection:DatabaseService){}

    async getAgricultorCard( usuario:IUsuario, id_temporada?:number ){

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

        const sql = ` SELECT COUNT(DISTINCT(A.id_agric)) AS total
        FROM agricultor A
        INNER JOIN ficha F USING (id_agric)
        INNER JOIN anexo_contrato AC USING(id_ficha)
        INNER JOIN detalle_quotation DQ USING(id_de_quo)
        ${inner} 
        WHERE 1 ${filtro }`;
        const agricultores = await this.dbConnection.select( sql );
        return {
            titulo:`Growers`,
            total:agricultores[0].total
        };

    }


}