import { Request, Response } from 'express';
import { httpResponses } from '../utils/';
import { SequelizeConnection } from '../model/database/SequelizeConnectionProvider';
import { DatabaseConnections } from '../utils/DatabaseConnection';
import { DatabaseService } from '../model/database/DataBaseService';
import Usuario from '../model/model/Usuario';
import { JWTService } from '../middlewares/JWTService';



export const login = async (req:Request,  res:Response)  => {

    const { username, password } = req.body;


    try {

        const exportParams = new DatabaseConnections("EXPORT").getSystem();

        if(!exportParams){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`No se pudo obtener los parametros de la BD`,
                data:null
            });
        }
        // console.log({exportParams})
        const dbProviderExport = new SequelizeConnection( exportParams );
        const dbExport = new DatabaseService(dbProviderExport);
        const usuarioExport = new Usuario(dbExport);
        const userExport = await usuarioExport.getUserForLogin(username, password);
        // const isExportUser = (userExport) ? false : true;

        const vegetablesParams = new DatabaseConnections("VEGETABLES").getSystem();
        if(!vegetablesParams){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`No se pudo obtener los parametros de la BD`,
                data:null
            });
        }
        // console.log({vegetablesParams})
        const dbProviderVegetables = new SequelizeConnection( vegetablesParams );
        
        const dbVegetables = new DatabaseService(dbProviderVegetables);
        const usuarioVegetables = new Usuario(dbVegetables);
        const userVegetables = await usuarioVegetables.getUserForLogin(username, password);


        if(userExport === null && userVegetables === null){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`Usuario y/o Contraseña son incorrectos`,
                data:null
            });
        }


        

        if(userExport !== null && userVegetables !== null){

            const loginResponse = {
                usuario:userExport,
                variosSistemas:true,
                sistemas:[
                    {
                        id:exportParams._id,
                        imagen:exportParams.system_image_path,
                        id_usuario:userExport.id_usuario
                    },
                    {
                        id:vegetablesParams._id,
                        imagen:vegetablesParams.system_image_path,
                        id_usuario:userVegetables.id_usuario
                    }
                ]
            }
            
            return res.status(httpResponses.HTTP_OK).json({
                ok:true,
                message:`Falta Aun`,
                data:loginResponse
            })

        }


        if(userExport !== null){
            const token = await new JWTService().generarJWT( 
                userExport.id_usuario, 
                `${userExport.nombre} ${userExport.apellido_p} ${userExport.apellido_m}`, 
                "EXPORT" );

            if(!token.ok){
                return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok:false,
                    message:`Problemas en funcion login : ${token.message}`
                });
            }

            const loginResponse = {
                usuario:userExport,
                variosSistemas:false,
                token:token.message,
                sistemas:[
                    {
                        id:exportParams._id,
                        imagen:exportParams.system_image_path,
                        id_usuario:userExport.id_usuario
                    }
                ]
            }

            return res.status(httpResponses.HTTP_OK).json({
                ok:true,
                message:`Bienvenido`,
                data:loginResponse
            })
        }

        if(userVegetables !== null){
            const token = await new JWTService().generarJWT( 
                userVegetables.id_usuario, 
                `${userVegetables.nombre} ${userVegetables.apellido_p} ${userVegetables.apellido_m}`, 
                "EXPORT" );

            if(!token.ok){
                return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok:false,
                    message:`Problemas en funcion login : ${token.message}`
                });
            }

            const loginResponse = {
                usuario:userVegetables,
                variosSistemas:false,
                token:token.message,
                sistemas:[
                    {
                        id:vegetablesParams._id,
                        imagen:vegetablesParams.system_image_path,
                        id_usuario:userVegetables.id_usuario
                    }
                ]
            }

            return res.status(httpResponses.HTTP_OK).json({
                ok:true,
                message:`Bienvenido`,
                data:loginResponse
            })
        }
        
    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion login : ${error}`,
            data:null
        });
        
    }


}


export const setSystem = async (req:Request, res:Response) => {

    const { id_usuario, system } = req.body;

    try {

        const params = new DatabaseConnections(system).getSystem();
        if(!params){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`No se pudo obtener parametros de BD`,
                data:null
            }); 
        }
        const dbProvider = new SequelizeConnection( params );
        const db = new DatabaseService(dbProvider);
        const usuario = new Usuario(db);
        const user = await usuario.getUserById(Number(id_usuario));
        if(!user){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`No se encontro usuario enviado`,
                data:null
            }); 
        }

        const token = await new JWTService().generarJWT( 
            user.id_usuario, 
            `${user.nombre} ${user.apellido_p} ${user.apellido_m}`, 
            system );

        if(!token.ok){
            return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Problemas en funcion login : ${token.message}`,
                data:null
            });
        }

        const loginResponse = {
            usuario:user,
            variosSistemas:false,
            token:token.message,
            sistemas:[
                {
                    id:params._id,
                    imagen:params.system_image_path,
                    id_usuario:user.id_usuario
                }
            ]
        }

        return res.status(httpResponses.HTTP_OK).json({
            ok:true,
            message:'Bienvenido',
            data:loginResponse
        })



        
    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion setSystem : ${error}`,
            data:null
        });
    }

}