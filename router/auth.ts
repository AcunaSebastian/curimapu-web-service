
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { login, setSystem } from '../controllers/';
import { validarCampos, JWTService } from '../middlewares/';


export const authRouter:Router = Router();
const jwtService = new JWTService();


authRouter.post('/login', [
    check('username', 'Debes incluir el nombre de usuario').notEmpty(),
    check('password', 'Debes incluir la contraseña').notEmpty(),
    validarCampos
], login);

authRouter.post('/set-system', [
    check('id_usuario', 'Debe incluir el id de usuario').notEmpty(),
    check('system', 'Debe incluir el sistema').notEmpty(),
    validarCampos
], setSystem)

authRouter.post('/renew', [
    jwtService.validarJWT,
    validarCampos
],(req:Request, res:Response)=>jwtService.revalidarJWT(req, res));