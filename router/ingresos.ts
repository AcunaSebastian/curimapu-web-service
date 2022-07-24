import { Router } from "express";
import { getIngresos } from '../controllers/';
import { validarCampos, JWTService } from '../middlewares/';

export const ingresosRouter:Router = Router();
const jwtService = new JWTService();

ingresosRouter.get('/', [
    jwtService.validarJWT,
    validarCampos
], getIngresos);
