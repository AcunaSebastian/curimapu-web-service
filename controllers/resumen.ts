import { Request, Response } from "express";
import { Resumen } from "../model";
import { httpResponses } from "../utils";


export const getResumen = async (req: Request, res:Response) => {

    const usuario = req.usuario;
    const db = req.bd_conection;

    const { id_especie, id_temporada } = req.query as unknown as { id_especie:number; id_temporada:number;};

  


    try {

        const resumen = new Resumen( db );

        const cabeceras = await resumen.getCabecera( id_temporada, id_especie );
        
        const preData = await resumen.getData(id_temporada, id_especie, usuario);

        console.log(preData)

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            response:`resumen`,
            data:{
                cabeceras,
                preData
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