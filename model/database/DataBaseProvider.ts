export interface PreparedInsert {
    table:string;
    params:{}
}
export interface PreparedUpdate {
    table:string;
    params:{};
    where:string;
}

export abstract class DatabaseProvider { 

    abstract disconnect():Promise<void>;

    abstract insert(preparedInsert:PreparedInsert):Promise<[number, string]>;

    abstract update(preparedUpdate:PreparedUpdate):Promise<[number, string]>;

    abstract delete(query:string): Promise<[number, string]>;

    abstract select(query:string): Promise<any[]>;

}