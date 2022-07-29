"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const model_1 = require("../model/");
const utils_1 = require("../utils");
class JWTService {
    async validarJWT(req, res, next) {
        const token = req.header('x-token');
        if (!token) {
            return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                ok: false,
                message: 'we need the token on the request',
                data: null
            });
        }
        try {
            const { _id, system } = jsonwebtoken_1.default.verify(token, process.env.PUBLIC_OR_PRIVATE_KEY);
            console.log({ _id, system });
            const dbParam = new utils_1.DatabaseConnections(system).getSystem();
            if (!dbParam) {
                return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                    ok: false,
                    message: 'cant get some parameters',
                    data: null
                });
            }
            const dbProvider = new model_1.SequelizeConnection(dbParam);
            const db = new model_1.DatabaseService(dbProvider);
            const user = new model_1.Usuario(db);
            const usuario = await user.getUserById(_id);
            if (!usuario) {
                return res.status(utils_1.httpResponses.HTTP_BAD_REQUEST).json({
                    ok: false,
                    message: `User isn't exist `,
                    data: null
                });
            }
            req.usuario = usuario;
            req.bd_conection = db;
            req.bd_params = dbParam;
            next();
        }
        catch (error) {
            return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: `invalid token ${error}`,
                data: null
            });
        }
    }
    async generarJWT(_id, name, system) {
        return new Promise((resolve, reject) => {
            const payload = { _id, name, system };
            jsonwebtoken_1.default.sign(payload, process.env.PUBLIC_OR_PRIVATE_KEY, {}, (err, token) => {
                if (err)
                    reject({ ok: false, message: `can't create the token` });
                resolve({ ok: true, message: token });
            });
        });
    }
    async revalidarJWT(req, res) {
        const getUser = req.usuario;
        const { _id, system_image_path } = req.bd_params;
        const token = await this.generarJWT(getUser.id_usuario, `${getUser.nombre} ${getUser.apellido_p} ${getUser.apellido_m}`, _id);
        if (!token.ok) {
            return res.status(utils_1.httpResponses.HTTP_INTERNAL_SERVER_ERROR).json({
                ok: false,
                message: `invalid Token  ${token.message}`,
                data: null
            });
        }
        return res.status(utils_1.httpResponses.HTTP_OK).json({
            ok: true,
            message: `Renewed`,
            data: {
                usuario: getUser,
                token: token.message,
                variosSistemas: false,
                sistemas: [
                    {
                        id: _id,
                        imagen: system_image_path,
                        id_usuario: getUser.id_usuario
                    }
                ]
            }
        });
    }
}
exports.JWTService = JWTService;
