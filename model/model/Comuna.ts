import { DatabaseService } from "../database";


export default class Comuna { 


    constructor(private dbConnection:DatabaseService){}


    async obtenerComuna() {

        const sql = `SELECT * FROM comuna`;

    }
}