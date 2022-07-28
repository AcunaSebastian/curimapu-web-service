"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.setSystem = exports.login = void 0;
const utils_1 = require("../utils/");
const SequelizeConnectionProvider_1 = require("../model/database/SequelizeConnectionProvider");
const DatabaseConnection_1 = require("../utils/DatabaseConnection");
const DataBaseService_1 = require("../model/database/DataBaseService");
const Usuario_1 = __importDefault(require("../model/model/Usuario"));
const JWTService_1 = require("../middlewares/JWTService");
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const exportParams = new DatabaseConnection_1.DatabaseConnections("EXPORT").getSystem();
        if (!exportParams) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `can't get some parameters`,
                data: null
            });
        }
        // console.log({exportParams})
        const dbProviderExport = new SequelizeConnectionProvider_1.SequelizeConnection(exportParams);
        const dbExport = new DataBaseService_1.DatabaseService(dbProviderExport);
        const usuarioExport = new Usuario_1.default(dbExport);
        const userExport = await usuarioExport.getUserForLogin(username, password);
        // const isExportUser = (userExport) ? false : true;
        const vegetablesParams = new DatabaseConnection_1.DatabaseConnections("VEGETABLES").getSystem();
        if (!vegetablesParams) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `can't get some parameters`,
                data: null
            });
        }
        // console.log({vegetablesParams})
        const dbProviderVegetables = new SequelizeConnectionProvider_1.SequelizeConnection(vegetablesParams);
        const dbVegetables = new DataBaseService_1.DatabaseService(dbProviderVegetables);
        const usuarioVegetables = new Usuario_1.default(dbVegetables);
        const userVegetables = await usuarioVegetables.getUserForLogin(username, password);
        if (userExport === null && userVegetables === null) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `User or password are incorrect`,
                data: null
            });
        }
        if (userExport !== null && userVegetables !== null) {
            const loginResponse = {
                usuario: userExport,
                variosSistemas: true,
                sistemas: [
                    {
                        id: exportParams._id,
                        imagen: exportParams.system_image_path,
                        id_usuario: userExport.id_usuario
                    },
                    {
                        id: vegetablesParams._id,
                        imagen: vegetablesParams.system_image_path,
                        id_usuario: userVegetables.id_usuario
                    }
                ]
            };
            return res.status(utils_1.httpResponses.HTTP_OK).json({
                ok: true,
                message: `Falta Aun`,
                data: loginResponse
            });
        }
        if (userExport !== null) {
            usuarioExport.setIngreso(userExport, 'c.curimapu');
            const token = await new JWTService_1.JWTService().generarJWT(userExport.id_usuario, `${userExport.nombre} ${userExport.apellido_p} ${userExport.apellido_m}`, "EXPORT");
            if (!token.ok) {
                return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: `problems at login funtion: ${token.message}`
                });
            }
            const loginResponse = {
                usuario: userExport,
                variosSistemas: false,
                token: token.message,
                sistemas: [
                    {
                        id: exportParams._id,
                        imagen: exportParams.system_image_path,
                        id_usuario: userExport.id_usuario
                    }
                ]
            };
            return res.status(utils_1.httpResponses.HTTP_OK).json({
                ok: true,
                message: `Welcome`,
                data: loginResponse
            });
        }
        if (userVegetables !== null) {
            usuarioVegetables.setIngreso(userVegetables, 'c.vegetables');
            const token = await new JWTService_1.JWTService().generarJWT(userVegetables.id_usuario, `${userVegetables.nombre} ${userVegetables.apellido_p} ${userVegetables.apellido_m}`, "VEGETABLES");
            if (!token.ok) {
                return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: `problems at login funtion: ${token.message}`
                });
            }
            const loginResponse = {
                usuario: userVegetables,
                variosSistemas: false,
                token: token.message,
                sistemas: [
                    {
                        id: vegetablesParams._id,
                        imagen: vegetablesParams.system_image_path,
                        id_usuario: userVegetables.id_usuario
                    }
                ]
            };
            return res.status(utils_1.httpResponses.HTTP_OK).json({
                ok: true,
                message: `Welcome`,
                data: loginResponse
            });
        }
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `problems at login funtion: ${error}`,
            data: null
        });
    }
};
exports.login = login;
const setSystem = async (req, res) => {
    const { id_usuario, system } = req.body;
    try {
        const params = new DatabaseConnection_1.DatabaseConnections(system).getSystem();
        if (!params) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `can't get some parameters`,
                data: null
            });
        }
        const dbProvider = new SequelizeConnectionProvider_1.SequelizeConnection(params);
        const db = new DataBaseService_1.DatabaseService(dbProvider);
        const usuario = new Usuario_1.default(db);
        const user = await usuario.getUserById(Number(id_usuario));
        if (!user) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `Can't find the user that you send`,
                data: null
            });
        }
        usuario.setIngreso(user, (system === 'EXPORT') ? 'c.curimapu' : 'c.vegetables');
        const token = await new JWTService_1.JWTService().generarJWT(user.id_usuario, `${user.nombre} ${user.apellido_p} ${user.apellido_m}`, system);
        if (!token.ok) {
            return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: `Problems at  login funcion: ${token.message}`,
                data: null
            });
        }
        const loginResponse = {
            usuario: user,
            variosSistemas: false,
            token: token.message,
            sistemas: [
                {
                    id: params._id,
                    imagen: params.system_image_path,
                    id_usuario: user.id_usuario
                }
            ]
        };
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'Welcome',
            data: loginResponse
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problems at setSystem funcion : ${error}`,
            data: null
        });
    }
};
exports.setSystem = setSystem;
const changePassword = async (req, res) => {
    const { passwordVieja, passwordNueva, passwordRepetida } = req.body;
    const usuario = req.usuario;
    const bd = req.bd_conection;
    try {
        const usuarioClass = new Usuario_1.default(bd);
        const existePass = await usuarioClass.getUserForLogin(usuario.user, passwordVieja);
        if (!existePass) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `Contraseña antigua no coincide.`,
                data: null
            });
        }
        if (passwordNueva !== passwordRepetida) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `Contraseñas nuevas no coinciden.`,
                data: null
            });
        }
        const nuevaPass = await usuarioClass.changePassword(usuario, passwordNueva);
        if (!nuevaPass) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `No se pudo actualizar la contraseña`,
                data: null
            });
        }
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: false,
            message: `Contraseña actualizada con exito`,
            data: null
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion changePassword : ${error}`,
            data: null
        });
    }
};
exports.changePassword = changePassword;
