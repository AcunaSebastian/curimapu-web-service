import { DatabaseService } from '../database/';
import { IResumen, ISystemParameters, IUsuario } from '../../interfaces/';
import { Constants } from '../../utils';
import { Foraneo } from './';


interface IParamsLC {
    usuario:IUsuario,
    id_temporada:number;
    id_especie:number;
    etapa?:number;
    limit?:number;
    page?:number;
    num_anexo?:string;
    ready_batch?:string;
    recomendaciones?:string;
    agricultor?:string;
    predio?:string;
    lote?:string;
    variedad?:string;
}

export default class LibroCampo {
  


    constructor(private dbConnection: DatabaseService){}



    async getCabecera(  params:IParamsLC ){

        const { id_temporada, id_especie, usuario, etapa } = params;


        let filtro = '';
        let inner = '';


     

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            if(usuario.usuarios_enlazados.length > 0){

                inner += ` INNER JOIN cli_pcm CPCM USING (id_prop_mat_cli) `;

                filtro += ` AND ( ${usuario.usuarios_enlazados.map( enlaces => 
                    ` CPCM.id_cli = '${ enlaces }' AND CPCM.ver = '1' `).join(` OR `)} ) `;
                    
            }

        }

      


        const sql = `SELECT 
        PCM.id_prop_mat_cli,
        PCM.id_esp,
        PCM.id_prop,
        PCM.id_etapa,
        PCM.id_tempo,
        PCM.id_sub_propiedad,
        PCM.orden,
        PCM.identificador,
        PCM.foraneo,
        PCM.tabla,
        PCM.campo,
        P.nombre_en AS nombre_propiedad, SP.nombre_en AS nombre_sub_propiedad 
        FROM prop_cli_mat PCM
        ${inner}
        LEFT JOIN propiedades P USING (id_prop) 
        INNER JOIN sub_propiedades SP USING (id_sub_propiedad)
        WHERE aplica = 'SI' AND id_tempo = '${id_temporada}' AND id_esp = '${id_especie}'
        ${filtro}
        ORDER BY PCM.orden ASC;`;


        const cabecera:IResumen[] = await this.dbConnection.select( sql );

        return cabecera;


    }


    async getCabeceraCustom(  params:{id_temporada:number;id_especie:number;id_cliente:number; etapa?:number[]} ){

        const { id_temporada, id_especie, id_cliente, etapa = [2, 3, 4] } = params;


        let filtro = '';
        let inner = '';


        inner += ` INNER JOIN cli_pcm CPCM USING (id_prop_mat_cli) `;
        filtro += ` AND CPCM.id_cli = '${ id_cliente }' AND CPCM.ver = '1' `;

      
        if(etapa.length > 0){
            filtro += ` AND ( ${etapa.map(el => ` PCM.id_etapa = '${el}' `).join(` OR `)} )`;
        }


        const sql = `SELECT 
        PCM.id_prop_mat_cli,
        PCM.id_esp,
        PCM.id_prop,
        PCM.id_etapa,
        PCM.id_tempo,
        PCM.id_sub_propiedad,
        PCM.orden,
        PCM.identificador,
        PCM.foraneo,
        PCM.tabla,
        PCM.campo,
        etapa.nombre AS etapa,
        especie.nombre AS especie,
        P.nombre_en AS nombre_propiedad, SP.nombre_en AS nombre_sub_propiedad 
        FROM prop_cli_mat PCM
        ${inner}
        LEFT JOIN propiedades P USING (id_prop) 
        INNER JOIN etapa USING (id_etapa)
        INNER JOIN especie USING (id_esp)
        INNER JOIN sub_propiedades SP USING (id_sub_propiedad)
        WHERE aplica = 'SI' AND id_tempo = '${id_temporada}' AND id_esp = '${id_especie}'
        ${filtro}
        ORDER BY PCM.orden ASC;`;


        const cabecera:IResumen[] = await this.dbConnection.select( sql );

        return cabecera;


    }


    async getData( params:IParamsLC ){


        const { id_temporada, id_especie, usuario, limit, page = 0,
            num_anexo,
            ready_batch,
            recomendaciones,
            variedad,
            agricultor,
            predio,
            lote } = params;


        const cabeceras:IResumen[] = await this.getCabecera( params );

        let filtroPCM = ``;
        let innerPCM = ``;
        let filtro = ``;

    
        if( usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            innerPCM += ` INNER JOIN cli_pcm CPCM USING (id_prop_mat_cli) `;
            let tmp = ` CPCM.id_cli = '${usuario.id_usuario}' AND CPCM.ver = '1' `;
            for (const enlaces of usuario.usuarios_enlazados) {
                tmp += ` OR CPCM.id_cli = '${ enlaces }' AND CPCM.ver = '1' `;
            }

            filtroPCM += ` AND ( ${tmp} ) `;
        }

        if(usuario.usuarios_enlazados.length > 0){

            let tmp = ``;
            for (const enlaces of usuario.usuarios_enlazados) {
                if(tmp.length > 0) tmp += ` OR `;
                tmp += ` Q.id_cli = '${enlaces}' ` ;
            }
            
            if(tmp.length > 0){
                filtro += ` AND ( ${tmp} ) `;
            }

        }


        if(usuario.isUsuarioDetQuo){
            filtro += ` AND DQ.id_de_quo IN (SELECT id_de_quo FROM usuario_det_quo WHERE id_usuario = '${usuario.id_usuario}') `;
        }

        if(variedad){
            filtro += ` AND materiales.nom_hibrido LIKE '%${variedad}%' `;
        }

        if( num_anexo ){
            filtro += ` AND AC.num_anexo LIKE '%${num_anexo}%' `;
        }
        if(ready_batch){
            filtro += ` AND AC.ready_batch LIKE '%${ready_batch}%' `;
        }
        if(recomendaciones){
            filtro += ` AND AC.id_ac IN (SELECT id_ac FROM visita WHERE recome LIKE '%${recomendaciones}%' ) `;
        }

        if(agricultor){
            filtro += ` AND A.razon_social LIKE '%${agricultor}%' `;
        }

        if(predio) {
            filtro += ` AND P.nombre LIKE '%${predio}%' `;
        }

        if(lote){
            filtro += ` AND L.nombre LIKE '%${lote}%' `;
        }


        
        let limite = ``;
        if( limit ){ 
            const pagina = (page > 0) ? ( page - 1 ) * limit : 0;
            limite = ` LIMIT ${pagina}, ${limit} `;
         }

        const sql = `SELECT 
        AC.num_anexo,
        AC.id_ac,
        Q.id_cli,
        Q.id_esp,
        Q.id_tempo,
        Q.numero_contrato,
        A.razon_social AS nombre_agricultor,
        L.nombre AS lote,
        P.nombre AS predio,
        AC.ready_batch,
        AC.has_gps,
        materiales.nom_hibrido AS variedad,
        E.nombre AS especie,
        (SELECT recome FROM visita WHERE id_ac = AC.id_ac ORDER BY id_visita DESC LIMIT 1 ) AS recomendaciones
      FROM
        detalle_quotation DQ
        INNER JOIN quotation Q ON (DQ.id_quotation = Q.id_quotation)
        INNER JOIN especie E ON (Q.id_esp = E.id_esp)
        INNER JOIN anexo_contrato AC ON (DQ.id_de_quo = AC.id_de_quo) 
        INNER JOIN materiales ON (AC.id_materiales = materiales.id_materiales)
        INNER JOIN ficha F USING (id_ficha)
        INNER JOIN agricultor A USING (id_agric)
        INNER JOIN lote L ON (F.id_lote = L.id_lote)
        INNER JOIN predio P ON (F.id_pred = P.id_pred)
        WHERE  Q.id_esp='${id_especie}' AND Q.id_tempo='${id_temporada}' ${filtro} ${limite} `;

        const anexos = await this.dbConnection.select( sql );

        if(anexos.length <=  0) return anexos;


        const respuestaAnexos:any[] = []

        for (const anexo of anexos) {

            const sql = `SELECT 
                DVP.id_prop_mat_cli,
                DVP.valor,
                DVP.id_det_vis_prop
                FROM
                    prop_cli_mat PCM
                ${innerPCM}
                LEFT JOIN detalle_visita_prop DVP ON (PCM.id_prop_mat_cli = DVP.id_prop_mat_cli)
                INNER JOIN visita V ON (DVP.id_visita = V.id_visita)
                WHERE V.id_ac='${anexo.id_ac}' AND PCM.aplica = 'SI' ${filtroPCM}
                ORDER BY PCM.orden ASC `;
            const datosVisita = await this.dbConnection.select( sql );

            const tpmData = [];

            for( const cabecera of cabeceras ){

                if(cabecera.foraneo === 'NO'){

                    const elementos = datosVisita.filter( dato => dato.id_prop_mat_cli === cabecera.id_prop_mat_cli);
                    elementos.sort((el, al) => al.id_det_vis_prop - el.id_det_vis_prop);

                    if(elementos.length > 0) tpmData.push({...elementos[0], sp:cabecera.nombre_sub_propiedad});
                    else tpmData.push({id_prop_mat_cli:cabecera.id_prop_mat_cli,id_det_vis_prop:null, valor:null, sp:cabecera.nombre_sub_propiedad})

                }

                if( cabecera.foraneo === 'SI'){
                    const foraneo = new Foraneo( this.dbConnection );

                    const datoForaneo = await foraneo.getForaneo(cabecera, anexo.id_ac);
                    tpmData.push({
                        id_prop_mat_cli:cabecera.id_prop_mat_cli, 
                        id_det_vis_prop:null, 
                        valor: datoForaneo?.data || '',
                        sp:cabecera.nombre_sub_propiedad
                    })
                }

            }

            respuestaAnexos.push({
                ...anexo,
                data:tpmData
            });
        }

        return respuestaAnexos;

    }


    async getImagenes(id_anexo: number, systemParams:ISystemParameters ) {


        const sql = `SELECT fotos.* FROM fotos 
        INNER JOIN visita USING (id_visita)
        WHERE tipo = 'V' AND visita.id_ac = '${ id_anexo }' `;


        const fotosVisitas = await  this.dbConnection.select( sql );
        
        const nuevasFotosVisitas = fotosVisitas.map( foto => {

            const rutaFoto = foto.ruta_foto.replaceAll(`${systemParams.document_folder}/img_android`, `${systemParams.compressed_image_folder}`);

            const nuevaUrl = `http://www.zcloud.cl/`+rutaFoto.replaceAll('../', '')
            
            const urlImgOriginal = `http://www.zcloud.cl/${systemParams.proyect_main_folder}/core/models/mostrarImagen.php?ruta_imagen=${rutaFoto}`;

            return {
                ...foto,
                ruta_muestra_foto:nuevaUrl,
                ruta_foto_original:urlImgOriginal
            }

        })

        return nuevasFotosVisitas;

    }


}