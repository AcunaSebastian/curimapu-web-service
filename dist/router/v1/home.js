"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
const express_validator_1 = require("express-validator");
exports.homeRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.homeRouter.get('/', [
    jwtService.validarJWT,
    (0, express_validator_1.check)("id_temporada", "Debes incluir el id de temporada").notEmpty(),
    middlewares_1.validarCampos
], controllers_1.getHome);
