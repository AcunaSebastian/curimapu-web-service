import { Router } from "express";
import {  getExcel, getResumen } from '../../controllers';
import { validarCampos, JWTService } from '../../middlewares';
import { check } from 'express-validator';

export const resumenRouter:Router = Router();
const jwtService = new JWTService();

resumenRouter.get('/', [
    jwtService.validarJWT,
    check("id_especie", "Debes incluir el id de la especie").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getResumen);


resumenRouter.get('/get-excel', [
    jwtService.validarJWT,
    check("id_especie", "Debes incluir el id de la especie").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getExcel)