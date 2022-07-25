"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitasRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
const express_validator_1 = require("express-validator");
exports.visitasRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.visitasRouter.get('/', [
    jwtService.validarJWT,
    middlewares_1.validarCampos
], controllers_1.getVisitas);
exports.visitasRouter.get('/get-pdf', [
    jwtService.validarJWT,
    (0, express_validator_1.check)("id_visita", "debes incluir el id de la visita").notEmpty(),
    middlewares_1.validarCampos
], controllers_1.getPDFVisita);
