import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import 'dotenv/config'
import { SequelizeConnection, DatabaseService, Usuario } from '../model/';
import { DatabaseConnections, httpResponses } from '../utils';
import { IUsuario } from '../interfaces/';


interface JwtPayload {
    _id: number;
    system:string;
  }


export class JWTService {


    async validarJWT( req:Request, res:Response, next:NextFunction) {

        const token = req.header('x-token');

        
        if( !token ){
            return res.status( httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:'No hay token en la peticion',
                data:null
            })
        }


        try {
            

            const { _id, system } = JWT.verify( token, process.env.PUBLIC_OR_PRIVATE_KEY!) as JwtPayload;

            const dbParam = new DatabaseConnections(system).getSystem();
            if(!dbParam) {
                return res.status( httpResponses.HTTP_BAD_REQUEST).json({
                    ok:false,
                    message:'No se pudo obtener parametros de BD',
                    data:null
                })
            }
            const dbProvider = new SequelizeConnection(dbParam);
            const db  = new DatabaseService(dbProvider);

            const user = new Usuario(db);

            const usuario:IUsuario | null = await user.getUserById(_id);
            
            if(!usuario){
                return res.status( httpResponses.HTTP_BAD_REQUEST).json({
                    ok:false,
                    message:'Usuario no existe',
                    data:null
                })
            }

            req.usuario = usuario;
            req.bd_conection = db;
            req.bd_params = dbParam;

            next();

        } catch (error) {
            return res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Token no valido ${error}`,
                data:null
            })
        }


    }

    async generarJWT( _id:bigint, name:string, system:string ){

        return new Promise<{ok:boolean; message:string | undefined;}> ( ( resolve, reject ) => {
            const payload = { _id, name, system };


            JWT.sign( payload, process.env.PUBLIC_OR_PRIVATE_KEY!, {}, (err, token) => {
                if(err) reject({ok:false, message:'No se pudo generar el Token'});
                resolve({ ok:true, message:token })
            })

        })
    }


    async revalidarJWT(req:Request, res:Response){

        const getUser = req.usuario;
        const { _id, system_image_path } = req.bd_params;

        const token  = await this.generarJWT(
            getUser.id_usuario, 
            `${getUser.nombre} ${getUser.apellido_p} ${getUser.apellido_m}`, 
            _id);

        if(!token.ok){
            return res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Token no valido ${token.message}`,
                data:null
            })
        }

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:`Renovado`,
            data:{
                usuario:getUser,
                token:token.message,
                variosSistemas:false,
                sistemas:[
                    {
                        id:_id,
                        imagen:system_image_path,
                        id_usuario:getUser.id_usuario
                    }
                ]
            }
            
        })

    }


}