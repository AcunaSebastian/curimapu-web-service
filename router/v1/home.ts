import { Router } from "express";
import { getHome } from '../../controllers';
import { validarCampos, JWTService } from '../../middlewares';
import { check } from 'express-validator';

export const homeRouter:Router = Router();
const jwtService = new JWTService();

homeRouter.get('/', [
    jwtService.validarJWT,
    validarCampos
], getHome);