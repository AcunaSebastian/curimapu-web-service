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
                message:`can't get some parameters`,
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
                message:`can't get some parameters`,
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
                message:`User or password are incorrect`,
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
                message:`We need another step`,
                data:loginResponse
            })

        }

        if(userExport !== null){

            usuarioExport.setIngreso(userExport, 'c.curimapu');

            const token = await new JWTService().generarJWT( 
                userExport.id_usuario, 
                `${userExport.nombre} ${userExport.apellido_p} ${userExport.apellido_m}`, 
                "EXPORT" );

            if(!token.ok){
                return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok:false,
                    message:`problems at login funtion: ${token.message}`
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
                message:`Welcome`,
                data:loginResponse
            })
        }

        if(userVegetables !== null){

            usuarioVegetables.setIngreso(userVegetables, 'c.vegetables');
            const token = await new JWTService().generarJWT( 
                userVegetables.id_usuario, 
                `${userVegetables.nombre} ${userVegetables.apellido_p} ${userVegetables.apellido_m}`, 
                "VEGETABLES" );

            if(!token.ok){
                return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok:false,
                    message:`problems at login funtion: ${token.message}`
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
                message:`Welcome`,
                data:loginResponse
            })
        }
        
    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`problems at login funtion: ${error}`,
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
                message:`can't get some parameters`,
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
                message:`Can't find the user that you send`,
                data:null
            }); 
        }


        usuario.setIngreso(user, (system === 'EXPORT') ? 'c.curimapu' : 'c.vegetables');

        const token = await new JWTService().generarJWT( 
            user.id_usuario, 
            `${user.nombre} ${user.apellido_p} ${user.apellido_m}`, 
            system );

        if(!token.ok){
            return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok:false,
                message:`Problems at  login funcion: ${token.message}`,
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
            message:'Welcome',
            data:loginResponse
        })



        
    } catch (error) {
        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problems at setSystem funcion : ${error}`,
            data:null
        });
    }

}


export const changePassword = async (req:Request, res:Response) => {


    const { passwordVieja, passwordNueva, passwordRepetida } = req.body;

    const usuario = req.usuario;
    const bd = req.bd_conection;

    try {

        const usuarioClass = new Usuario( bd );

        const existePass = await usuarioClass.getUserForLogin(usuario.user, passwordVieja);
    
        if(!existePass){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`old password does't match`,
                data:null
            });
        }
    
        if(passwordNueva !== passwordRepetida){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`Contraseñas nuevas no coinciden.`,
                data:null
            });
        }
    
        const nuevaPass = await usuarioClass.changePassword(usuario, passwordNueva);
    
        if(!nuevaPass){
            return res.status(httpResponses.HTTP_BAD_REQUEST).json({
                ok:false,
                message:`No se pudo actualizar la contraseña`,
                data:null
            });
        }
    
        return res.status(httpResponses.HTTP_OK).json({
            ok:false,
            message:`Contraseña actualizada con exito`,
            data:null
        });
        
    } catch (error) {

        return res.status(httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok:false,
            message:`Problemas en funcion changePassword : ${error}`,
            data:null
        });
        
    }

}