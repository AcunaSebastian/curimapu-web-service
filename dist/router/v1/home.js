"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
exports.homeRouter = (0, express_1.Router)();
const jwtService = new middlewares_1.JWTService();
exports.homeRouter.get('/', [
    jwtService.validarJWT,
    middlewares_1.validarCampos
], controllers_1.getHome);
