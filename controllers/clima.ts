import { Request, Response } from "express"
import Region from "../model/model/Region";



export const llenarComunas = async (req:Request, res:Response) => {


    const bd = req.bd_conection;


    const region = new Region(bd);
    const regiones = await region.obtenerRegion();



    res.status(200).json({regiones})


}