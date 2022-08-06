
import { Router } from "express";
import { llenarComunas } from "../../controllers/clima";
import { validarCampos, JWTService } from '../../middlewares';

export const climaRouter:Router = Router();
const jwtService = new JWTService();

climaRouter.get('/get-clima', [
    jwtService.validarJWT,
    validarCampos
], llenarComunas);