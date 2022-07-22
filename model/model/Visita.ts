import { DatabaseService } from '../database/DataBaseService';
import { IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Visita {

    constructor(private dbConnection:DatabaseService){}



    async getVisitasCard( usuario:IUsuario, id_temporada?:number ) {


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

        const sql = ` SELECT  COUNT(DISTINCT(V.id_visita)) AS total 
        FROM visita V 
        INNER JOIN anexo_contrato AC USING(id_ac)
        INNER JOIN ficha F USING(id_ficha)
        INNER JOIN detalle_quotation DQ ON (DQ.id_de_quo = AC.id_de_quo)
        ${inner} 
        WHERE 1 ${filtro }`;

        
        const visitas = await this.dbConnection.select( sql );
        return { titulo:`Visits`, total:visitas[0].total};

    }


}