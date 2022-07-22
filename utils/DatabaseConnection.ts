import 'dotenv/config';
import { ISystemParameters } from '../interfaces/';


const systems:ISystemParameters[] = [
    {
        _id:'EXPORT',
        bd_name:process.env.IZ_BD_NAME!,
        bd_pass:process.env.IZ_BD_PASS!,
        bd_user:process.env.IZ_BD_USER!,
        ip_bd:process.env.IZ_IP_BD!,
        ip_host:process.env.IZ_IP_HOST!,
        ip_ftp:process.env.IZ_IP_FTP!,
        pass_ftp:process.env.IZ_FTP_PASS!,
        user_ftp:process.env.IZ_FTP_USER!,
        database_type:process.env.DATABASE_TYPE!,
        document_folder:process.env.IZ_DOCUMENT_FOLDER!,
        proyect_folder:process.env.IZ_PROYECT_FOLDER!
    },
    {
        _id:'VEGETABLES',
        bd_name:process.env.IZ_BD_NAME_VEGETABLES!,
        bd_pass:process.env.IZ_BD_PASS_VEGETABLES!,
        bd_user:process.env.IZ_BD_USER_VEGETABLES!,
        ip_bd:process.env.IZ_IP_BD_VEGETABLES!,
        ip_host:process.env.IZ_IP_HOST_VEGETABLES!,
        ip_ftp:process.env.IZ_IP_FTP_VEGETABLES!,
        pass_ftp:process.env.IZ_FTP_PASS_VEGETABLES!,
        user_ftp:process.env.IZ_FTP_USER_VEGETABLES!,
        database_type:process.env.DATABASE_TYPE_VEGETABLES!,
        document_folder:process.env.IZ_DOCUMENT_FOLDER_VEGETABLES!,
        proyect_folder:process.env.IZ_PROYECT_FOLDE_VEGETABLESR!
    }
]


export class DatabaseConnections { 

    constructor(private _id:string ){ }

    getSystem () {
        const selectedSystem = systems.filter( system => system._id = this._id)[0];
        return selectedSystem;
    }

}