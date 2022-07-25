import fs from "fs";
import { Request, Response } from "express";
import { ExcelClass, tipoExcel, LibroCampo } from "../model";
import { httpResponses } from "../utils";


export const getLibroCampo = async (req:Request, res:Response) => {



    const { id_especie, id_temporada, etapa, limit,
        page = 0,
        num_anexo,
        ready_batch,
        recomendaciones,
        agricultor,
        predio,
        lote } = req.query;

    const usuario = req.usuario;
    const db = req.bd_conection;



    try {

        const params = {
            usuario,
            id_especie: id_especie as unknown as number,
            id_temporada : id_temporada as unknown as number,
            etapa:(etapa) ? etapa as unknown as number: undefined,
            lote:lote as unknown as string,
            predio:predio as unknown as string,
            limit:(limit) ? Number(limit): undefined,
            page:(page) ? Number(page) : 0,
            num_anexo:num_anexo as unknown as string,
            ready_batch:ready_batch as unknown as string,
            recomendaciones:recomendaciones as unknown as string,
            agricultor:agricultor as unknown as string,

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

export const getExcelLC = async (req:Request, res:Response) => {


    const { id_especie, id_temporada, etapa, limit,
        page = 0,
        num_anexo,
        ready_batch,
        recomendaciones,
        agricultor,
        predio,
        lote } = req.query;

        const usuario = req.usuario;
        const db = req.bd_conection;


        try {

            const params = {
                usuario,
                id_especie: id_especie as unknown as number,
                id_temporada : id_temporada as unknown as number,
                etapa:(etapa) ? etapa as unknown as number: undefined,
                lote:lote as unknown as string,
                predio:predio as unknown as string,
                limit:(limit) ? Number(limit): undefined,
                page:(page) ? Number(page) : 0,
                num_anexo:num_anexo as unknown as string,
                ready_batch:ready_batch as unknown as string,
                recomendaciones:recomendaciones as unknown as string,
                agricultor:agricultor as unknown as string,
                type:"ALL" as tipoExcel
            }

            const excel = new ExcelClass( db );
            const downloadExcel = await excel.generarExcel(params);

            const excelFile = fs.readFileSync(`./`+downloadExcel);

            fs.unlinkSync(`./`+downloadExcel);
            
            return res.status(httpResponses.HTTP_OK).contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(excelFile);

            
        } catch (error) {
        
        res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR ).json({
            ok:false,
            message:`PROBLEMAS EN FUNCION getLibroCampo ERROR : ${error}`,
            data:null
        })
    }
}