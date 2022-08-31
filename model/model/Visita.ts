import { DatabaseService } from '../database/';
import { ISystemParameters, IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';
import axios from 'axios';
import fs from 'fs';
import moment from 'moment';


interface IFiltroVisitas {
    usuario:IUsuario;
    num_anexo?:string;
    lote?:string;
    agricultor?:string;
    ready_batch?:string;
    id_variedad?:number;
    id_temporada?:number;
    id_especie?:number;
    fecha_visita?:string;
    limit?:number;
    page:number
}

interface IVisitaCompuesta  { 
    id_visita:number;
    lote:string;
    num_anexo:string;
    nombre_agricultor:string;
    ready_batch:string;
    desc_especie:string;
    id_especie:number;
    desc_variedad:string;
    id_variedad:number;
    fecha_visita:string;
}

export default class Visita {

    constructor(private dbConnection:DatabaseService){}

    async getVisitas(filters:IFiltroVisitas){

        const { 
            usuario, 
            id_temporada, 
            id_especie, 
            id_variedad,
            fecha_visita,
            agricultor,
            ready_batch,
            lote,
            num_anexo,
            limit,
            page = 0
          } = filters;


        let filtro = ``;
        let inner = ``;

        if(id_temporada){
            filtro += ` AND Q.id_tempo = '${id_temporada}' `;
        }

        if(num_anexo){
            filtro += ` AND num_anexo LIKE '%${num_anexo}%' `;
        }

        if(id_especie){
            filtro += ` AND Q.id_esp = '${id_especie}' `;
        }

        if(id_variedad){
            filtro += ` AND DQ.id_materiales = '${id_variedad}' `;
        }

        if(agricultor){
            filtro += ` AND A.razon_social LIKE '%${agricultor}%' `;
        }

        if(fecha_visita){
            filtro += ` AND V.fecha_r = '${fecha_visita}' `;
        }

        if(ready_batch){
            filtro += ` AND AC.ready_batch LIKE '%${ready_batch}%'`
        }
        if(lote){
            filtro += ` AND L.nombre LIKE '%${lote}%' `;
        }


        let limite = ``;
        if(limit){
            const pagina = (page > 0) ? ( page - 1 ) * limit : 0;
            limite = ` LIMIT ${pagina}, ${limit} `;
        }


        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE) {

            let tmp = ` Q.id_cli = '${usuario.id_usuario}' `;

            for (const enlace of usuario.usuarios_enlazados) {
                tmp += ` OR Q.id_cli = '${enlace}' `;
            }

            filtro += ` AND ( ${tmp} ) `;
        }



        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){
            filtro += ` AND U.id_usuario = '${ usuario.id_usuario }' `;
            inner += ` LEFT JOIN usuario_det_quo UDQ ON (UDQ.id_de_quo = DQ.id_de_quo)
            LEFT JOIN usuarios U ON (U.id_usuario = UDQ.id_usuario) `;
        }


        const sql = `SELECT 
        V.id_visita,
        L.nombre AS lote,
        P.nombre AS predio,
        AC.num_anexo,
        A.razon_social AS nombre_agricultor,
        AC.ready_batch,
        E.nombre AS desc_especie,
        Q.id_esp AS id_especie,
        M.nom_hibrido AS desc_variedad,
        DQ.id_materiales AS id_variedad,
        V.fecha_r AS fecha_visita,
        temporada.nombre AS temporada
        FROM visita V
        INNER JOIN anexo_contrato AC USING (id_ac) 
        INNER JOIN detalle_quotation DQ USING (id_de_quo)
        INNER JOIN quotation Q USING (id_quotation)
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN agricultor A USING (id_agric)
        INNER JOIN lote L ON (F.id_lote = L.id_lote)
        INNER JOIN predio P ON (F.id_pred = P.id_pred)
        INNER JOIN materiales M ON ( DQ.id_materiales = M.id_materiales )
        INNER JOIN especie E ON (Q.id_esp = E.id_esp)
        INNER JOIN temporada ON (Q.id_tempo = temporada.id_tempo)

        ${inner} WHERE  cron_envia_corr != 'CREADA DESDE WEB' ${filtro} ORDER BY V.fecha_r DESC ${limite} `;

        const visitas:IVisitaCompuesta[] = await this.dbConnection.select( sql );

        return visitas;

    }

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


    async getPDF(id_visita:number, bd_params:ISystemParameters):Promise<string>{

        try {
            const namePDf = `uploads/pdf/pdf_${id_visita}_${moment().format('YYYYMMSSHHmmss')}.pdf`;

            const writer = fs.createWriteStream(namePDf);

            const {data} = await axios.get(`http://${bd_params.ip_host}/${bd_params.proyect_folder}/info_visita.php?visita=${id_visita}`, {
                responseType:'stream'
            });
            

            data.pipe(writer);

            return new Promise( resolve => {
                writer.on('finish', () => {  console.log('escribiendo...');  resolve(namePDf);});
            })
        

            
        } catch (error) {

            if(axios.isAxiosError(error)){
                console.log(error.request)
            }

            return '';
        }
    }
}``