import { ICliente } from "../../interfaces";
import { DatabaseService } from "../database";

export default class Cliente {

    constructor( private dbConnection:DatabaseService ) {}


    async getClienteById( id_cliente:number ):Promise<ICliente>{

        const sql  = ` SELECT * FROM cliente WHERE id_cli = '${id_cliente}' LIMIT 1;`; 
        const clientes  = await this.dbConnection.select( sql );
        return clientes[0];
    }


}