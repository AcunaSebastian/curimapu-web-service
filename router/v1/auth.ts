
import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { changePassword, login, setSystem } from '../../controllers';
import { validarCampos, JWTService } from '../../middlewares';


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

authRouter.post('/change-password', [
    jwtService.validarJWT,
    check('passwordVieja', 'Debe incluir la contaseña actual').notEmpty(),
    check('passwordNueva', 'Debe incluir la contaseña nueva').notEmpty(),
    check('passwordRepetida', 'Debe incluir la contaseña repetida').notEmpty(),
    validarCampos
], changePassword)

authRouter.post('/renew', [
    jwtService.validarJWT,
    validarCampos
],(req:Request, res:Response)=>jwtService.revalidarJWT(req, res));