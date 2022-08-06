"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.climaRouter = void 0;
const express_1 = require("express");
const clima_1 = require("../../controllers/clima");
const middlewares_1 = require("../../middlewares");
exports.climaRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.climaRouter.get('/get-clima', [
    jwtService.validarJWT,
    middlewares_1.validarCampos
], clima_1.llenarComunas);
