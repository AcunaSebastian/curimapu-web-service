import { DatabaseService } from '../database/DataBaseService';
import { IVariedad, IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';

export default class Variedad {

    constructor(private dbConnection:DatabaseService){}

    async getVariedades(usuario:IUsuario):Promise<IVariedad[]>{
        let filtro = ``;
        let inner = ``;

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            filtro += ` AND U.id_usuario = '${ usuario.id_usuario }' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }

        const sql = `SELECT 
            materiales.*, 
            materiales.id_materiales AS value, 
            materiales.nom_hibrido AS label,
            temporada.nombre AS temporada
        FROM detalle_quotation DQ
        INNER JOIN quotation USING (id_quotation)
        INNER JOIN temporada USING (id_tempo)
        INNER JOIN materiales USING(id_materiales) 
        ${inner}
        WHERE 1 ${filtro}
        ORDER BY nom_hibrido ASC`;


        
        const variedades:IVariedad[] = await this.dbConnection.select( sql );


        const nuevoArrego = variedades.map(variedad => {

            const existenMas = variedades.filter( vari => vari.nom_hibrido === variedad.nom_hibrido && vari.id_materiales_SAP != variedad.id_materiales_SAP);

            const nuevoNombre = `${variedad.temporada}-${variedad.nom_hibrido}`;

            if(existenMas.length <= 0) return {...variedad, nom_hibrido:nuevoNombre, label:nuevoNombre};


            return {
                ...variedad, 
                label:`${nuevoNombre}-${variedad.id_materiales_SAP}`,
                nom_hibrido:`${nuevoNombre}-${variedad.id_materiales_SAP}`
            }
            
            
        });


        return nuevoArrego;

    }


    async getVariedadesCard( usuario:IUsuario, id_temporada?:number ){

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

        const sql = ` SELECT COUNT(DISTINCT(DQ.id_de_quo)) AS total
        FROM detalle_quotation DQ
        INNER JOIN quotation Q ON (DQ.id_quotation = Q.id_quotation)
        ${inner} 
        WHERE 1 ${filtro }`;

        const variedades = await this.dbConnection.select( sql );
        return { titulo:`Varieties`, total:variedades[0].total};

    }


}