import { DatabaseProvider, PreparedInsert, PreparedUpdate } from './';



export class DatabaseService  {

    constructor( public databasProvider:DatabaseProvider){}


    async disconnect():Promise<void>{
        return await this.databasProvider.disconnect();
    }

    async insert(preparedInsert:PreparedInsert):Promise<[number, string]> { 
        return await this.databasProvider.insert(preparedInsert);
    }

    async select(query:string):Promise<any[]>{
        return await this.databasProvider.select(query);
    }

    async update(preparedUpdate:PreparedUpdate):Promise<[number, string]>{
        return await this.databasProvider.update(preparedUpdate);
    }

    async delete( query: string):Promise<[number, string]>{
        return await this.databasProvider.delete( query );
    }

}