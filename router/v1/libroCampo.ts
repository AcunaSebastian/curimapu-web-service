import { Router } from "express";
import {  getCabeceraReporteQuot, getExcelLC, getImagenesAnexo, getLibroCampo, getReporteQuotation } from '../../controllers';
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


libroCampoRouter.get('/get-reporte-cliente', [
    jwtService.validarJWT,
    check("id_cliente", "Debes incluir el id del cliente").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getReporteQuotation)


libroCampoRouter.get('/get-cabecera-reporte-cliente', [
    jwtService.validarJWT,
    check("id_cliente", "Debes incluir el id del cliente").notEmpty(),
    check("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    validarCampos
], getCabeceraReporteQuot)


// libroCampoRouter.get('/get-one-image', [
//     jwtService.validarJWT,
//     check("path", "Debes incluir el path de la imagenes").notEmpty(),
//     validarCampos
// ], getImage)