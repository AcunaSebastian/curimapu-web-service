import { Dialect, QueryTypes, Sequelize } from 'sequelize';
import 'dotenv/config';

import { ISystemParameters } from '../../interfaces/';
import { DatabaseProvider , PreparedInsert, PreparedUpdate} from './';


export class SequelizeConnection implements DatabaseProvider {

    private bdConnection:Sequelize;

    constructor( public params:ISystemParameters ){
        try {
            this.bdConnection = new Sequelize(this.params.bd_name, this.params.bd_user, this.params.bd_pass, {
                host:this.params.ip_bd,
                dialect:this.params.database_type as  Dialect,
                timezone:'America/Santiago',
                logging:false
            })

             this.authenticate();
             console.log('Database connected successfully.')

        } catch (error) {
            throw new Error(` Cant connect to the database ${ error }`);
        }
    }
   
    async delete( query:string ):Promise<[number, string]> {

        try {
            await this.bdConnection.query(query, { type:QueryTypes.DELETE});
            return [1, 'success'];
        } catch (error) {
            return [0, `An error has appear when we'r tryin to make the delete = ${error}`]
        }
        
    }

    async disconnect() {
        if(this.bdConnection){
            await this.bdConnection.close();
            console.log('Database disconnected successfully.')
        }
    }
    
    async insert(preparedInsert:PreparedInsert): Promise<[number, string]> {

        try {

            const [a,] = await this.bdConnection.query(`INSERT INTO ${preparedInsert.table} 
            ( ${ Object.keys(preparedInsert.params).map( (el) => el).join(',') } ) 
            VALUES (  ${ Object.keys(preparedInsert.params).map( (el) => `:${el}`).join(',') } ) `, {
                replacements:preparedInsert.params,
                type:QueryTypes.INSERT
            });

            return [a, 'success'];
            
        } catch (error) {
            console.log(error)
            return [-1 , `An error has appear when we'r trying to make the insert = ${error}`];
        }
        
        
    }
    async update( preparedUpdate:PreparedUpdate):Promise<[number, string]> {

        try {


            const query = `UPDATE ${preparedUpdate.table} 
            SET ${Object.keys(preparedUpdate.params).map( el => `${el} = :${el}`).join(',')} 
            WHERE  ${ preparedUpdate.where }`;

            const [, b] = await this.bdConnection.query( query, {
                replacements:preparedUpdate.params,
                type:QueryTypes.UPDATE
            });


            // console.log({updateResponse:b, query:query})

            return [b, 'success'];

            
        } catch (error) {
            return [-1, ` An error has appear when we'r trying to make the update == ${error}`];
        }
        
    }


    async select(query:string): Promise<any[]> {
        try {
            return await this.bdConnection.query(query, { type:QueryTypes.SELECT});
        } catch (error) {
            throw new Error(` ERROR SELECT ${error}`)
        }
    }

    async authenticate() {
        await this.bdConnection.authenticate();
        console.log('Custom database running')
    }


}