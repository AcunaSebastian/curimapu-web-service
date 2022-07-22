import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import 'dotenv/config'
import { SequelizeConnection, DatabaseService } from '../model/';
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
                message:'No hay token en la peticion'
            })
        }


        try {
            

            const { _id, system } = JWT.verify( token, process.env.PUBLIC_OR_PRIVATE_KEY!) as JwtPayload;


            const dbProvider = new SequelizeConnection(new DatabaseConnections(system).getSystem());
            const db  = new DatabaseService(dbProvider);


            const usuario:IUsuario[] = await db.select(`SELECT * FROM usuario WHERE id_user = '${_id}'; `);
            if(usuario.length <= 0){
                return res.status( httpResponses.HTTP_BAD_REQUEST).json({
                    ok:false,
                    message:'Usuario no existe'
                })
            }

            req.usuario = usuario;
            req.bd_conection = db;
            req.bd_params = new DatabaseConnections(system).getSystem();

            next();

        } catch (error) {
            return res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Token no valido ${error}`
            })
        }


    }

    async generarJWT( _id:string, name:string, system:string ){

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
        const { _id } = req.bd_params;

        const token  = await this.generarJWT(getUser[0].id_user as unknown as string, getUser[0].nom_user, _id);

        if(!token.ok){
            return res.status( httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Token no valido ${token.message}`
            })
        }


        const usuario:{
            _id:number;
            rut:string;
            name:string;
            email:string;
            login_name:string;
            phone:string;
            isAdmin:boolean;
            authorize_sp:number;
            authorize_oc:number;
            tecnique_authorization_oc:number;
            authorize_compra:number;
        } = {
            _id:getUser[0].id_user,
            rut:getUser[0].rut_user,
            name:getUser[0].nom_user,
            email:getUser[0].correo_user,
            login_name:getUser[0].login_user,
            phone:getUser[0].fono_user,
            isAdmin:(getUser[0].admin === 'SI'),
            authorize_sp:(getUser[0].autoriza_sp),
            authorize_oc:(getUser[0].autoriza_oc),
            tecnique_authorization_oc:(getUser[0].autoriza_oc_tec),
            authorize_compra:(getUser[0].autoriza_compra)
        }

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:`Renovado`,
            usuario,
            token:token.message
        })

    }


}