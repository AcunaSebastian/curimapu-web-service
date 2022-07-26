"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumenRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers/");
const middlewares_1 = require("../middlewares/");
const express_validator_1 = require("express-validator");
exports.resumenRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.resumenRouter.get('/', [
    jwtService.validarJWT,
    (0, express_validator_1.check)("id_especie", "Debes incluir el id de la especie").notEmpty(),
    (0, express_validator_1.check)("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    middlewares_1.validarCampos
], controllers_1.getResumen);
exports.resumenRouter.get('/get-excel', [
    jwtService.validarJWT,
    (0, express_validator_1.check)("id_especie", "Debes incluir el id de la especie").notEmpty(),
    (0, express_validator_1.check)("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    middlewares_1.validarCampos
], controllers_1.getExcel);
