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
                message:'we need the token on the request',
                data:null
            })
        }


        try {
            

            const { _id, system } = JWT.verify( token, process.env.PUBLIC_OR_PRIVATE_KEY!) as JwtPayload;

            console.log({_id, system })

            const dbParam = new DatabaseConnections(system).getSystem();
            
            if(!dbParam) {
                return res.status( httpResponses.HTTP_BAD_REQUEST).json({
                    ok:false,
                    message:'cant get some parameters',
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
                    message:`User isn't exist `,
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
                message:`invalid token ${error}`,
                data:null
            })
        }


    }

    async generarJWT( _id:bigint, name:string, system:string ){

        return new Promise<{ok:boolean; message:string | undefined;}> ( ( resolve, reject ) => {
            const payload = { _id, name, system };
            JWT.sign( payload, process.env.PUBLIC_OR_PRIVATE_KEY!, {}, (err, token) => {
                if(err) reject({ok:false, message:`can't create the token`});
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
                message:`invalid Token  ${token.message}`,
                data:null
            })
        }

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:`Renewed`,
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