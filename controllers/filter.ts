import { Request, Response } from "express";
import { IEspecie, IVariedad, ITemporada } from '../interfaces/';
import { httpResponses } from '../utils/';
import { Cliente, Especie, Variedad } from '../model/model/';
import Temporada from '../model/model/Temporada';
import { ICliente } from '../interfaces/Cliente';

export const getFilters = async (req:Request, res:Response) => {

    const db  = req.bd_conection;
    const usuario = req.usuario;

    try {
        


        const especie = new Especie( db );
        const variedad = new Variedad( db );
        const temporada = new Temporada( db );
        const clientesClass  = new Cliente( db );

        const especies:IEspecie[] = await especie.getEspeciesCliente(usuario);
        const variedades:IVariedad[] = await variedad.getVariedades(usuario);
        const temporadas:ITemporada[] = await temporada.getTemporadas(usuario);
        const clientes:ICliente[] = await clientesClass.getClienteByEnlace( usuario );




        const data = {
            especies,
            variedades,
            temporadas,
            clientes
        }

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:'Filtros',
            data
        })
        
    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion getFilters : ${error}`,
            data:null
        });
    }

}