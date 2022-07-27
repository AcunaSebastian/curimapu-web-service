import fs from 'fs';
import { Request, Response } from "express";
import { Resumen, ExcelClass, tipoExcel } from "../model";
import { httpResponses } from "../utils";


export const getResumen = async (req: Request, res:Response) => {

    const usuario = req.usuario;
    const db = req.bd_conection;

    const { id_especie, id_temporada, limit = 100, page = 0 } = req.query as unknown as { 
        id_especie:number; 
        id_temporada:number;
        limit?:number;
        page:number;
    };

    try {

        const resumen = new Resumen( db );

        const cabeceras = await resumen.getCabecera( id_temporada, id_especie );
        
        const preData = await resumen.getData(id_temporada, id_especie, usuario, page, limit);
        const preDataTotal = await resumen.getData(id_temporada, id_especie, usuario, page);

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            response:`resumen`,
            data:{
                cabeceras,
                data:preData,
                total:preDataTotal.length
            }
        })


    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion getResumen : ${error}`,
            data:null
        });
    }
} 

export const getExcel = async (req: Request, res:Response) => {

    const { id_especie, id_temporada } = req.query;

    const db = req.bd_conection;
    const usuario = req.usuario;


    const params  = {
        usuario,
        id_especie:Number(id_especie), 
        id_temporada:Number(id_temporada), 
        type:'RESUMEN' as tipoExcel
    }

    const excel = new ExcelClass( db );

    const downloadExcel = await excel.generarExcel(params);

    const excelFile = fs.readFileSync(`./`+downloadExcel);

    fs.unlinkSync(`./`+downloadExcel);
    
    return res.status(httpResponses.HTTP_OK).contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(excelFile);
        
}