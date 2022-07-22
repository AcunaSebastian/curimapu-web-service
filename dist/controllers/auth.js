"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSystem = exports.login = void 0;
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
                message: `No se pudo obtener los parametros de la BD`,
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
                message: `No se pudo obtener los parametros de la BD`,
                data: null
            });
        }
        // console.log({vegetablesParams})
        const dbProviderVegetables = new SequelizeConnectionProvider_1.SequelizeConnection(vegetablesParams);
        const dbVegetables = new DataBaseService_1.DatabaseService(dbProviderVegetables);
        const usuarioVegetables = new Usuario_1.default(dbVegetables);
        const userVegetables = await usuarioVegetables.getUserForLogin(username, password);
        const isVegetablesUser = (userVegetables) ? false : true;
        if (userExport === null && userVegetables === null) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: `Usuario y/o Contraseña son incorrectos`,
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
                        imagen: exportParams.system_image_path
                    },
                    {
                        id: vegetablesParams._id,
                        imagen: vegetablesParams.system_image_path
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
            const token = await new JWTService_1.JWTService().generarJWT(userExport.id_usuario, `${userExport.nombre} ${userExport.apellido_p} ${userExport.apellido_m}`, "EXPORT");
            if (!token.ok) {
                return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: `Problemas en funcion login : ${token.message}`
                });
            }
            const loginResponse = {
                usuario: userExport,
                variosSistemas: false,
                token: token.message,
                sistemas: [
                    {
                        id: exportParams._id,
                        imagen: exportParams.system_image_path
                    }
                ]
            };
            return res.status(utils_1.httpResponses.HTTP_OK).json({
                ok: true,
                message: `Bienvenido`,
                data: loginResponse
            });
        }
        if (userVegetables !== null) {
            const token = await new JWTService_1.JWTService().generarJWT(userVegetables.id_usuario, `${userVegetables.nombre} ${userVegetables.apellido_p} ${userVegetables.apellido_m}`, "EXPORT");
            if (!token.ok) {
                return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                    ok: false,
                    message: `Problemas en funcion login : ${token.message}`
                });
            }
            const loginResponse = {
                usuario: userVegetables,
                variosSistemas: false,
                token: token.message,
                sistemas: [
                    {
                        id: vegetablesParams._id,
                        imagen: vegetablesParams.system_image_path
                    }
                ]
            };
            return res.status(utils_1.httpResponses.HTTP_OK).json({
                ok: true,
                message: `Bienvenido`,
                data: loginResponse
            });
        }
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion login : ${error}`,
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
                message: `No se pudo obtener parametros de BD`,
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
                message: `No se encontro usuario enviado`,
                data: null
            });
        }
        const token = await new JWTService_1.JWTService().generarJWT(user.id_usuario, `${user.nombre} ${user.apellido_p} ${user.apellido_m}`, system);
        if (!token.ok) {
            return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: `Problemas en funcion login : ${token.message}`,
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
                    imagen: params.system_image_path
                }
            ]
        };
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: 'Bienvenido',
            data: loginResponse
        });
    }
    catch (error) {
        return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: `Problemas en funcion setSystem : ${error}`,
            data: null
        });
    }
};
exports.setSystem = setSystem;
