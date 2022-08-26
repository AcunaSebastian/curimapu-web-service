import Axios from "axios";
import { Request, Response } from "express"
import fs from "fs";
import Region from "../model/model/Region";

import xml2js from 'xml2js';



export const llenarComunas = async (req:Request, res:Response) => {


    const bd = req.bd_conection;


    const region = new Region(bd);
    const regiones = await region.obtenerRegion();

    const arregloComunas:any = [];

    for (const region of regiones) {
        

        const {data} = await Axios.get(`http://api.meteored.cl/index.php?api_lang=cl&division=${region.id_region_api}&affiliate_id=vb7jbic553ts`)

        // fs.writeFileSync(`uploads/xml/${region.nombre}.xml`, data);


        const json = await xml2js.parseStringPromise(data);

        const datos = json.report.location[0].data;

        const nuevosDatos = datos.map((comuna:any) => {
            return {
                id:comuna.name[0]['$'].id,
                name:comuna.name[0]._
            }
        });



        nuevosDatos.forEach( async(element:any) => {
            
            const sql = `SELECT * FROM comuna WHERE nombre  = "${element.name}"`;

            const dataComuna = await bd.select( sql );

            const comuna = dataComuna.flat();

            let cont = 0;
            if(comuna.length > 0){

                await bd.update({table:'comuna', params:{id_api:element.id}, where:` id_comuna='${comuna[0].id_comuna}' `})

            }
        });


    }



    res.status(200).json({regiones})


}