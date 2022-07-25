import { Request, Response } from "express";
import { Usuario } from '../model/model/';
import { httpResponses } from "../utils";


export const getIngresos = async (req:Request, res:Response) => {


    const { id,
        rut, nombre,
        fecha, hora, limit, page = 0 } = req.query;
    const usuario = req.usuario;
    const { _id } = req.bd_params;
    const db = req.bd_conection;


    try {

        const filterParams = {
            usuario,
            id: (id) ? id as  unknown as number : undefined,
            rut : (rut) && rut as string, 
            nombre: (nombre) && nombre as string,
            fecha: (fecha) && fecha as string, 
            hora: (hora) && hora as string,
            system:_id,
            limit: limit as unknown as number,
            page: page as unknown as number
        }
        
        const user = new Usuario( db );

        const ingresos = await user.getIngresos( filterParams );

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:`Ingresos`,
            data:{
                ingresos
            }
        })
        
    } catch (error) {

        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion getIngresos : ${error}`,
            data:null
        });
        
    }


}