import { Request, Response } from "express";
import { Agricultor, Anexo, Especie, Quotation, Variedad, Visita } from "../model";
import { httpResponses } from "../utils";


export const getHome = async(req:Request, res:Response) => {

    const { id_temporada } = req.body;
    const db = req.bd_conection;
    const usuario = req.usuario;


    

    try {

        const quotation = new Quotation( db );
        const variedad = new Variedad( db );
        const agricultor = new Agricultor( db );
        const anexo = new Anexo( db );
        const especie = new Especie( db );
        const visita = new Visita( db );


        const quotations = await quotation.getQuotationCard(usuario, id_temporada );
        const superficies = await quotation.getSurfaceQuotation(usuario, id_temporada );
        const kgContratados = await quotation.getKgContracted(usuario, id_temporada );
        const variedades = await variedad.getVariedadesCard(usuario, id_temporada );
        const agricultores = await agricultor.getAgricultorCard(usuario, id_temporada );
        const anexos = await anexo.getAnexosCard(usuario, id_temporada );
        const especies = await especie.getEspeciesCard(usuario, id_temporada );
        const visitas = await visita.getVisitasCard(usuario, id_temporada );



        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:'HOME',
            data:{
                quotations,
                variedades,
                agricultores,
                anexos,
                especies,
                superficies,
                kgContratados,
                visitas
            }
        })


        
    } catch (error) {

        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion getHome : ${error}`,
            data:null
        });
        
    }


    


}