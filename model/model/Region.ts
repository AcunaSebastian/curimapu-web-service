import { DatabaseService } from "../database";


export default class Region {

    constructor(private DbConnection:DatabaseService){}


    async obtenerRegion(){

        const sql = `SELECT * FROM region WHERE id_region_api IS NOT NULL`;
        const regiones = await this.DbConnection.select( sql );

        

        console.log(regiones)
        return regiones;
    }

}