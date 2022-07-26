import { Router } from "express";
import {  getExcelLC, getImage, getImagenesAnexo, getLibroCampo } from '../../controllers';
import { validarCampos, JWTService } from '../../middlewares';
import { check } from 'express-validator';

export const libroCampoRouter:Router = Router();
const jwtService = new JWTService();

libroCampoRouter.get('/', [
    jwtService.validarJWT,
    check("id_especie", "Debes incluir el id de la especie").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getLibroCampo);

libroCampoRouter.get('/get-excel', [
    jwtService.validarJWT,
    check("id_especie", "Debes incluir el id de la especie").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getExcelLC);


libroCampoRouter.get('/get-images', [
    jwtService.validarJWT,
    check("id_anexo", "Debes incluir el id del anexo").notEmpty(),
    validarCampos
], getImagenesAnexo)

libroCampoRouter.get('/get-one-image', [
    jwtService.validarJWT,
    check("path", "Debes incluir el path de la imagenes").notEmpty(),
    validarCampos
], getImage)