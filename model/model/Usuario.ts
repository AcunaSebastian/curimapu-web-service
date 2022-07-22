import { IUsuario } from '../../interfaces/';
import { DatabaseService } from '../database/';

export default class Usuario {


    constructor(private dbConnection:DatabaseService ){}



    async getUser(): Promise<IUsuario> {
        this.dbConnection.select(``);
        return [];
    }

    async getUserForLogin( username:string, password:string ): Promise<IUsuario> {
        return [];
    }


}