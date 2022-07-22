import { Router } from "express";
import { getHome } from '../controllers/';
import { validarCampos, JWTService } from '../middlewares/';
import { check } from 'express-validator';

export const homeRouter:Router = Router();
const jwtService = new JWTService();

homeRouter.get('/', [
    jwtService.validarJWT,
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getHome);