import { Router } from "express";
import {getVisitas, getPDFVisita } from '../controllers/';
import { validarCampos, JWTService } from '../middlewares/';
import { check } from 'express-validator';

export const visitasRouter:Router = Router();
const jwtService = new JWTService();

visitasRouter.get('/', [
    jwtService.validarJWT,
    validarCampos
], getVisitas);

visitasRouter.get('/get-pdf', [
    jwtService.validarJWT,
    check("id_visita", "debes incluir el id de la visita").notEmpty(),
    validarCampos
], getPDFVisita)