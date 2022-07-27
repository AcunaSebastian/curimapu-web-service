import fs from 'fs';
import { Request, Response } from "express";
import { Visita } from '../model/';
import { httpResponses } from '../utils/httpResponses';


export const getVisitas = async (req:Request, res:Response) => {


    const { 
        num_anexo,
        lote,
        agricultor,
        ready_batch,
        id_variedad, 
        id_temporada,
        id_especie,
        fecha_visita,
        limit = 100,
        page= 0
     } = req.query;


     const usuario = req.usuario;
     const db = req.bd_conection;

     try {

         const filter = {
            usuario,
            num_anexo: num_anexo as string,
            lote:lote as string,
            agricultor: agricultor as string,
            ready_batch: ready_batch as string,
            id_variedad: id_variedad as unknown as number,
            id_temporada: id_temporada as unknown as number,
            id_especie: id_especie as unknown as number,
            fecha_visita: fecha_visita as string,
            limit:limit as unknown as number,
            page:Number(page)
         
         }

         const visita = new Visita( db );

         const visitas = await visita.getVisitas( filter );
         const visitasTotal = await visita.getVisitas( {...filter, limit:undefined } );
   
         return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:'Visitas',
            data:{
               visitas,
               total:visitasTotal.length
            }
         })
      
     } catch (error) {

         return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
               ok:false,
               message:`Problemas en funcion getVisitas : ${error}`,
               data:null
         });
      
     }
}


export const getPDFVisita = async (req:Request, res:Response) => {

   const { id_visita } = req.query;


   const db = req.bd_conection;
   const bd_params = req.bd_params;


   try {

      const visita = new Visita( db );

      const pdf = await visita.getPDF( Number(id_visita) , bd_params);

      const pdfFile = fs.readFileSync(`./`+pdf);
      fs.unlinkSync(`./`+pdf);

      return res.status(httpResponses.HTTP_OK).contentType(`application/pdf`).send(pdfFile)
         
   } catch (error) {
      return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
         ok:false,
         message:`Problemas en funcion getPDFVisita : ${error}`,
         data:null
     });
   }

}