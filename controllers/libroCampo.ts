import { Request, Response } from "express";
import {LibroCampo} from '../model/model/';
import { httpResponses } from "../utils";


export const getLibroCampo = async (req:Request, res:Response) => {



    const { id_especie, id_temporada, etapa } = req.query;

    const usuario = req.usuario;
    const db = req.bd_conection;



    try {

        const params = {
            usuario,
            id_especie: id_especie as unknown as number,
            id_temporada : id_temporada as unknown as number,
            etapa:(etapa) ? etapa as unknown as number: undefined
        }


    const libroCampo = new LibroCampo( db );

    
    const cabeceras = await libroCampo.getCabecera( params );

    const finalCabs:any[] = [];

    if(cabeceras.length > 0){
        for (const cabecera of cabeceras) {
            

            const tmpSubProps = cabeceras.filter( cab => cab.id_prop === cabecera.id_prop);



            const existe  = finalCabs.filter( p => p.id_prop === cabecera.id_prop);
            if(existe.length <= 0){
                finalCabs.push({...cabecera, subProps:tmpSubProps});
            }


        }
    }

    const data = await libroCampo.getData( params );


    res.status( httpResponses.HTTP_OK ).json({
        ok:true,
        message:'LIBRO CAMPO',
        data:{
            cabecera:finalCabs,
            data
        }
    })
        
    } catch (error) {
        
        res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR ).json({
            ok:false,
            message:`PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
            data:null
        })
    }




}