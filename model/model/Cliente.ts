import { ICliente, IUsuario } from "../../interfaces";
import { Constants } from "../../utils";
import { DatabaseService } from "../database";

export default class Cliente {

    constructor( private dbConnection:DatabaseService ) {}


    async getClienteById( id_cliente:number ):Promise<ICliente>{

        const sql  = ` SELECT * FROM cliente WHERE id_cli = '${id_cliente}' LIMIT 1;`; 
        const clientes  = await this.dbConnection.select( sql );
        return clientes[0];
    }


    async getClienteByEnlace( usuario:IUsuario) {


        
        let filtro = ``;

        if(usuario.id_tipo_usuario === Constants.USUARIO_CLIENTE){

            if(usuario.usuarios_enlazados.length > 0){
                filtro = ` AND ( ${usuario.usuarios_enlazados.map( enlace => ` id_cli = '${enlace}' `).join(` OR `)} ) `;
            }
        }


        const sql = `SELECT cliente.*, cliente.id_cli AS value, cliente.razon_social AS label 
        FROM cliente  
        WHERE 1 ${filtro}
        ORDER BY razon_social ASC`;

        const clientes  = await this.dbConnection.select( sql );

        return clientes;
    }

}